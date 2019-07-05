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

## Roadmap

- [x] Docker support
- [x] Auto Updater
- [ ] VueJS based frontend
- [ ] Display page progress
- [ ] Ticker
- [ ] Changes highlight
