# vplan-viso

Vertretungsplan-Visualisierungssoftware für den Einsatz in Schulen

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
├── backend/        # HTTP-Endpoint router modules
├── frontend/       # VueJS frontend project
├── handlers/       # Independent abstracted modules running the app duties
├── helpers/        # Helper modules for dev environment
├── lib/            # Helper libraries
├── services/       # Main operating libraries
├── share/          # Shareable data files and config
├── test/           # Resources for testing
├── util/           # Small utility functions
└── index.js        # Entry module (async)
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
