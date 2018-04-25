<vplan-card>
  <div class="card">
    <header class="card-header">
      <h5 class="card-header-title title is-5 is-centered">
        { opts.queueday === 'current' ? 'Aktueller Vplan' : 'Folgender Vplan' }
      </h5>
    </header>
    <div class="card-content">
      <div class="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris.
        <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
        <hr> Zusätzpläne
        <br>
      </div>
    </div>
    <footer class="card-footer">
      <a href="" class="card-footer-item">
        <span class="icon">
          <i class="fas fa-edit"></i>
        </span>
        <span>Bearbeiten</span>
      </a>
      <a href="" class="card-footer-item">
        <span class="icon">
          <i class="fas fa-trash"></i>
        </span>
        <span>Löschen</span>
      </a>
    </footer>
  </div>
</vplan-card>