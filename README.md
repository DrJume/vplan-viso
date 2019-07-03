# vplan-viso

Vertretungsplan-Visualisierungssoftware für den Einsatz in Schulen

---

## Project structure

```tree
.
├── handlers/       # Independent abstracted modules running the app duties
├── helpers/        # Helper modules for dev environment
├── lib/            # Helper libraries for Vplan lifecycle
├── routes/         # HTTP-Endpoint router modules
├── services/       # Main operating libraries used by handlers
├── util/           # Small utility functions
├── test/           # Resources for testing
├── views/          # HTML view files
├── share/          # Shareable config and data files
└── index.js        # Entry module (async)
```
