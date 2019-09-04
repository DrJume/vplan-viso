# vplan-viso

Vertretungsplan-Visualisierungssoftware für den Einsatz in Schulen

---

### **Currently only supported on arm64v8**!

## Install

1. Install Docker

2. Write file docker-compose.yml:

    ```yaml
    version: '3'
    services:
      vplan-viso:
        image: drjume/vplan-viso
        container_name: vplan-viso
        ports:
          - "8080:8080"
        restart: unless-stopped
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
          - /opt/vplan-viso/share:/opt/vplan-viso/share
    ```

3. Run command

    ```bash
    docker-compose up -d
    ```

4. The application is accessible under http://localhost:8080

## Project structure

```tree
.
├── backend/        # HTTP-Endpoint router modules
├── frontend/       # VueJS frontend project
├── handlers/       # Independent abstracted modules running the app duties
├── helpers/        # Helper modules for dev environment
├── lib/            # Helper libraries for Vplan lifecycle
├── services/       # Main operating libraries used by handlers
├── share/          # Shareable config and data files
├── test/           # Resources for testing
├── util/           # Small utility functions
└── index.js        # Entry module (async)
```

## Roadmap

- [x] Docker support
- [x] Auto Updater
- [x] VueJS based frontend
- [x] Display page progress
- [ ] Ticker
- [x] Internal FTP Support
- [ ] Changes highlight
- [ ] Animate display paging
