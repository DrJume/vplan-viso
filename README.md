# vplan-viso

Vertretungsplan-Visualisierungssoftware für den Einsatz an öffentlichen Monitoren in Schulen

---

## Installation

- [Docker](https://get.docker.com/) (stable: >19.03.12)
- [docker-compose](https://docs.docker.com/compose/install/) (>1.26.2)

    **_Hinweis:_**
    _Docker sollte nicht mit root-Rechten genutzt werden!_
    Damit ein normaler User auf Docker zugreifen kann, muss er zur Docker-Gruppe hinzugefügt werden:
    
    ```bash
    $ sudo usermod -aG docker <user>
    ```

1. `docker-compose.vplan-viso.yml` aus dem [aktuellsten Release](https://github.com/DrJume/vplan-viso/releases/latest) herunterladen.

2. `docker-compose.vplan-viso.yml` gegebenenfalls anpassen:
    - externer Port _(Standardwert: `8080`)_
    - Pfad zum Volume _(Standardwert: `/opt/vplan-viso/share`)_

3. Mit **docker-compose** starten:
    ```bash
    $ docker-compose -f docker-compose.vplan-viso.yml up -d
    ```

    Das fertige Docker-Image wird von [DockerHub](https://hub.docker.com/repository/docker/drjume/vplan-viso) heruntergeladen und gestartet.

    Falls der Zugriff auf DockerHub nicht möglich ist, sind exportierte Docker-Images im komprimierten Tarball-Format jedem Release beigefügt. Das zur Prozessorarchitektur passende Image kann zuvor heruntergeladen und über
    ```bash
    $ docker image load -i <docker-image-tarball>
    ```
    reingeladen werden.

4. Fertigstellung

    ```bash
    $ docker logs vplan-viso
    ```
    Im Log zeigt sich neben der wichtigen Informationen auch die Addresse, unter welcher vplan-viso erreichbar ist.
    Die Monitoransichten sind unter `/display/students` bzw. `/display/teachers` zugänglich.

    Das Datenverzeichnis `share/` befindet sich im Volume des Docker Containers und ist im eingestellten Pfad, ersichtlich aus der `docker-compose.yml`, eingebunden.

    Es besteht aus:
    - `upload/` - Vetretungsplandateien werden hier hochgeladen.
    - `display/` - Gespeicherte VPlan-Dateien. Können gelöscht werden.
    - `logs/` - Weitere Logs (falls aktiviert)
    - `config.json` - Programm-Konfiguration. Damit Änderungen wirksam werden, muss vplan-viso neugestartet werden.

        ```bash
        $ docker restart vplan-viso
        ```

### Deinstallation

```bash
$ docker-compose -f docker-compose.vplan-viso.yml down
```

---

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
