```mermaid
graph TD
    A[App Root] --> B[Home Screen]
    B --> C[Math Worksheets]
    B --> D[Math Puzzles]
    B --> E[Word Problems]
    B --> F[Logic Puzzles]
    B --> G[Science Experiments]
    C & D & E & F & G --> H[Worksheet Preview]
    H --> I[PDF Download]
    B --> J[History]
    K[Worksheet Service] --> H
    L[Storage Service] --> J
```
