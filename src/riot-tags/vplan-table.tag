<vplan-table>
  <table ref="table" class="table is-fullwidth is-bordered is-striped">
    <thead>
      <th>Klasse</th>
      <th>Stunde</th>
      <th>Fach</th>
      <th>Lehrer</th>
      <th>Raum</th>
      <th>Info</th>
    </thead>
    <tr each={ entry in vplan.body }>
      <td>{ entry.class }</td>
      <td>{ entry.lesson }</td>
      <td>{ entry.subject }</td>
      <td>{ entry.teacher }</td>
      <td>{ entry.room }</td>
      <td>{ entry.info }</td>
    </tr>
  </table>

  <script>
    this.getData = async () => {
      axios(`/api/${this.opts.queue}?type=students`)
        .then(_ => {
          this.vplan=_.data
          this.update()
          console.log(this.vplan)
        })
        .catch(err => {
          if (err.response) {
            console.log(err.response)
            this.refs.table.hidden = true
          }
        })
      
    }
    this.getData()
    


  </script>
</vplan-table>