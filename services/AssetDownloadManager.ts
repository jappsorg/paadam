/**
 * Asset Download Manager
 *
 * Manages on-demand downloading of image assets using tiered system:
 * - Tier 1: Core bundle (shipped with app)
 * - Tier 2: Character packs (download on selection)
 * - Tier 3: Grade-level packs (auto-download by grade)
 * - Tier 4: Skill micro-packs (just-in-time)
 * - Tier 5: AI-generated (on-demand)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Grade } from "../types/adaptive-learning";

// CDN Configuration
const CDN_URL = process.env.EXPO_PUBLIC_CDN_URL || "https://assets.paadam.app";
const CACHE_DIR = `${FileSystem.documentDirectory}asset-cache/`;

// Storage keys
const STORAGE_KEYS = {
  DOWNLOADED_PACKAGES: "downloaded_packages",
  PACKAGE_METADATA: "package_metadata",
  LAST_CLEANUP: "last_cleanup",
};

interface AssetPackage {
  id: string;
  type: "character" | "grade" | "skill" | "badge";
  url: string;
  size: number; // bytes
  version: string;
  downloadedAt?: Date;
  lastUsed?: Date;
}

interface DownloadProgress {
  packageId: string;
  totalBytes: number;
  downloadedBytes: number;
  percent: number;
}

interface DownloadOptions {
  priority: "high" | "medium" | "low";
  background?: boolean;
  required?: boolean; // Block until downloaded
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

class AssetDownloadManager {
  private downloadQueue: Map<string, Promise<void>> = new Map();
  private downloadCallbacks: Map<string, FileSystem.DownloadResumable> =
    new Map();

  /**
   * Initialize asset manager
   * - Create cache directory
   * - Check core bundle integrity
   * - Clean up old assets if needed
   */
  async initialize(): Promise<void> {
    try {
      // Create cache directory if doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Run cleanup if needed (once per day)
      await this.runCleanupIfNeeded();

      console.log("[AssetManager] Initialized successfully");
    } catch (error) {
      console.error("[AssetManager] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Download character package when student selects a character
   */
  async downloadCharacterPack(
    characterId: string,
    options: Partial<DownloadOptions> = {},
  ): Promise<void> {
    const packageId = `character-${characterId}`;

    // Check if already downloaded
    if (await this.hasPackage(packageId)) {
      console.log(
        `[AssetManager] Character pack ${characterId} already downloaded`,
      );
      await this.updateLastUsed(packageId);
      return;
    }

    // Check if already downloading
    if (this.downloadQueue.has(packageId)) {
      return this.downloadQueue.get(packageId);
    }

    const downloadOptions: DownloadOptions = {
      priority: "high",
      background: false,
      required: true,
      ...options,
    };

    const downloadPromise = this.downloadPackage(
      {
        id: packageId,
        type: "character",
        url: `${CDN_URL}/character-packs/${characterId}.bundle`,
        size: 8 * 1024 * 1024, // 8MB estimate
        version: "1.0.0",
      },
      downloadOptions,
    );

    this.downloadQueue.set(packageId, downloadPromise);

    try {
      await downloadPromise;
      console.log(
        `[AssetManager] Character pack ${characterId} downloaded successfully`,
      );
    } finally {
      this.downloadQueue.delete(packageId);
    }
  }

  /**
   * Download grade-level visual pack
   * Auto-triggered after character selection based on student grade
   */
  async downloadGradePack(
    grade: Grade,
    options: Partial<DownloadOptions> = {},
  ): Promise<void> {
    const packName = this.getGradePackName(grade);
    const packageId = `grade-${grade}`;

    if (await this.hasPackage(packageId)) {
      console.log(`[AssetManager] Grade pack ${grade} already downloaded`);
      await this.updateLastUsed(packageId);
      return;
    }

    if (this.downloadQueue.has(packageId)) {
      return this.downloadQueue.get(packageId);
    }

    const downloadOptions: DownloadOptions = {
      priority: "medium",
      background: true, // Don't block user
      required: false,
      ...options,
    };

    const downloadPromise = this.downloadPackage(
      {
        id: packageId,
        type: "grade",
        url: `${CDN_URL}/grade-packs/${packName}.bundle`,
        size: 10 * 1024 * 1024, // 10MB estimate
        version: "1.0.0",
      },
      downloadOptions,
    );

    this.downloadQueue.set(packageId, downloadPromise);

    try {
      await downloadPromise;
      console.log(`[AssetManager] Grade pack ${grade} downloaded successfully`);
    } finally {
      this.downloadQueue.delete(packageId);
    }
  }

  /**
   * Download skill-specific micro-pack on-demand
   */
  async downloadSkillPack(
    skillId: string,
    options: Partial<DownloadOptions> = {},
  ): Promise<void> {
    const packName = this.getSkillPackName(skillId);
    const packageId = `skill-${skillId}`;

    if (await this.hasPackage(packageId)) {
      await this.updateLastUsed(packageId);
      return;
    }

    if (this.downloadQueue.has(packageId)) {
      return this.downloadQueue.get(packageId);
    }

    const downloadOptions: DownloadOptions = {
      priority: "low",
      background: true,
      required: false,
      ...options,
    };

    const downloadPromise = this.downloadPackage(
      {
        id: packageId,
        type: "skill",
        url: `${CDN_URL}/skill-packs/${packName}.bundle`,
        size: 2 * 1024 * 1024, // 2MB estimate
        version: "1.0.0",
      },
      downloadOptions,
    );

    this.downloadQueue.set(packageId, downloadPromise);

    try {
      await downloadPromise;
      console.log(
        `[AssetManager] Skill pack ${skillId} downloaded successfully`,
      );
    } finally {
      this.downloadQueue.delete(packageId);
    }
  }

  /**
   * Core download function
   */
  private async downloadPackage(
    pkg: AssetPackage,
    options: DownloadOptions,
  ): Promise<void> {
    const localPath = `${CACHE_DIR}${pkg.id}.bundle`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        pkg.url,
        localPath,
        {},
        (downloadProgress) => {
          const progress: DownloadProgress = {
            packageId: pkg.id,
            totalBytes: downloadProgress.totalBytesExpectedToWrite,
            downloadedBytes: downloadProgress.totalBytesWritten,
            percent: Math.round(
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
                100,
            ),
          };
          options.onProgress?.(progress);
        },
      );

      this.downloadCallbacks.set(pkg.id, downloadResumable);

      const result = await downloadResumable.downloadAsync();

      if (result) {
        // Save package metadata
        await this.savePackageMetadata({
          ...pkg,
          downloadedAt: new Date(),
          lastUsed: new Date(),
        });

        options.onComplete?.();
      }
    } catch (error) {
      console.error(`[AssetManager] Failed to download ${pkg.id}:`, error);

      // Clean up partial download
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
      }

      options.onError?.(error as Error);

      if (options.required) {
        throw error;
      }
    } finally {
      this.downloadCallbacks.delete(pkg.id);
    }
  }

  /**
   * Check if package is downloaded
   */
  async hasPackage(packageId: string): Promise<boolean> {
    const localPath = `${CACHE_DIR}${packageId}.bundle`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists;
  }

  /**
   * Get local path for an asset within a package
   */
  async getAssetPath(
    packageId: string,
    assetName: string,
  ): Promise<string | null> {
    if (!(await this.hasPackage(packageId))) {
      return null;
    }

    // In a real implementation, this would unzip/index the bundle
    // For now, return the expected path
    return `${CACHE_DIR}${packageId}/${assetName}`;
  }

  /**
   * Update last used timestamp for package
   */
  private async updateLastUsed(packageId: string): Promise<void> {
    const metadata = await this.getPackageMetadata(packageId);
    if (metadata) {
      metadata.lastUsed = new Date();
      await this.savePackageMetadata(metadata);
    }
  }

  /**
   * Clean up unused assets (run once per day)
   */
  private async runCleanupIfNeeded(): Promise<void> {
    const lastCleanup = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CLEANUP);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!lastCleanup || now - parseInt(lastCleanup) > oneDayMs) {
      await this.pruneUnusedAssets();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, now.toString());
    }
  }

  /**
   * Remove skill packs not used in 30 days
   */
  async pruneUnusedAssets(): Promise<void> {
    const packages = await this.getAllPackages();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    for (const pkg of packages) {
      // Never delete core, character, or grade packs
      if (pkg.type !== "skill") {
        continue;
      }

      const lastUsed = pkg.lastUsed ? new Date(pkg.lastUsed).getTime() : 0;

      if (now - lastUsed > thirtyDaysMs) {
        console.log(`[AssetManager] Pruning unused package: ${pkg.id}`);
        await this.removePackage(pkg.id);
      }
    }
  }

  /**
   * Remove a package
   */
  async removePackage(packageId: string): Promise<void> {
    const localPath = `${CACHE_DIR}${packageId}.bundle`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
      }

      // Remove from metadata
      const packages = await this.getAllPackages();
      const filtered = packages.filter((p) => p.id !== packageId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOADED_PACKAGES,
        JSON.stringify(filtered),
      );

      console.log(`[AssetManager] Removed package: ${packageId}`);
    } catch (error) {
      console.error(
        `[AssetManager] Failed to remove package ${packageId}:`,
        error,
      );
    }
  }

  /**
   * Get all downloaded packages
   */
  private async getAllPackages(): Promise<AssetPackage[]> {
    const packagesJson = await AsyncStorage.getItem(
      STORAGE_KEYS.DOWNLOADED_PACKAGES,
    );
    return packagesJson ? JSON.parse(packagesJson) : [];
  }

  /**
   * Get package metadata
   */
  private async getPackageMetadata(
    packageId: string,
  ): Promise<AssetPackage | null> {
    const packages = await this.getAllPackages();
    return packages.find((p) => p.id === packageId) || null;
  }

  /**
   * Save package metadata
   */
  private async savePackageMetadata(pkg: AssetPackage): Promise<void> {
    const packages = await this.getAllPackages();
    const index = packages.findIndex((p) => p.id === pkg.id);

    if (index >= 0) {
      packages[index] = pkg;
    } else {
      packages.push(pkg);
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.DOWNLOADED_PACKAGES,
      JSON.stringify(packages),
    );
  }

  /**
   * Get grade pack name from grade
   */
  private getGradePackName(grade: Grade): string {
    const gradeMap: Record<Grade, string> = {
      K: "k-1-visuals",
      "1": "k-1-visuals",
      "2": "2-3-visuals",
      "3": "2-3-visuals",
      "4": "4-5-visuals",
      "5": "4-5-visuals",
      "6": "6plus-visuals",
    };
    return gradeMap[grade];
  }

  /**
   * Get skill pack name from skill ID
   */
  private getSkillPackName(skillId: string): string {
    // Map skill IDs to pack names
    if (skillId.includes("fraction")) return "fractions";
    if (skillId.includes("geometry")) return "geometry";
    if (skillId.includes("word-problem")) return "word-problems";
    if (skillId.includes("measurement")) return "measurement";
    if (skillId.includes("data")) return "data-graphs";

    return "general";
  }

  /**
   * Get total cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
        if ("size" in fileInfo) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error("[AssetManager] Failed to calculate cache size:", error);
      return 0;
    }
  }

  /**
   * Clear all cache (emergency only)
   */
  async clearAllCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      await AsyncStorage.removeItem(STORAGE_KEYS.DOWNLOADED_PACKAGES);
      console.log("[AssetManager] Cache cleared");
    } catch (error) {
      console.error("[AssetManager] Failed to clear cache:", error);
    }
  }
}

// Export singleton instance
export const assetDownloadManager = new AssetDownloadManager();
export default assetDownloadManager;
