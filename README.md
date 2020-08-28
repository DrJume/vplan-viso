# vplan-viso

Vertretungsplan-Visualisierungssoftware für den Einsatz an öffentlichen Monitoren in Schulen

---

## Install

1. Install [Docker](https://get.docker.com/) (stable)

2. Download [docker-compose.yml](https://github.com/DrJume/vplan-viso/blob/master/docker-compose.yml)

3. Run commands:

    ```bash
    docker-compose up --build -d
    ```

4. The application is accessible under [http://localhost:8080](http://localhost:8080)

## Documentation

[**`Go to Wiki`**](https://github.com/DrJume/vplan-viso/wiki)

## Project structure

```tree
.
├── src             # NodeJS source (backend)
│   ├── endpoints/      # HTTP-Endpoint router modules
│   ├── frontend/       # VueJS frontend
│   ├── handlers/       # Independent abstracted modules for main duties
│   ├── helpers/        # Helper modules for dev environment
│   ├── lib/            # Own stateless libraries
│   ├── services/       # Common used modules
│   ├── util/           # Small utility functions
│   └── index.js        # Entry module (async)
├── test/           # Resources for testing
└── share/          # Data files and config during operation
```

## Roadmap

- [x] Docker support
- [x] VueJS based frontend
- [x] Display page progress
- [x] Internal FTP Support
- [ ] Secure Updater
- [ ] Ticker
- [ ] Changes highlight
- [ ] Animate display paging
