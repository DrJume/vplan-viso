<vplan-teachers-column>
  <div ref="head" style="margin-top: 5px; margin-bottom: 10px" hidden>
    <h2 class="title is-2">{ vplan.head.title }</h2>
  </div>

  <table ref="table" class="table is-fullwidth is-narrow is-striped" hidden>
    <thead>
      <th>Lehrer</th>
      <th>Stunde</th>
      <th>Klasse/Kurs</th>
      <th>Fach neu</th>
      <th>Raum neu</th>
      <th>für Fach</th>
      <th>für Lehrer</th>
      <th>Info</th>
    </thead>
    <tbody></tbody>
  </table>

  <div ref="progress" style="margin: auto 10px 15px 10px" hidden>
    <progress class="progress is-small" value="0" max="100"></progress>
  </div>

  <div ref="notification" class="notification subtitle is-2 has-text-grey" style="margin: auto 10% auto 10%" hidden>
    Der Vertretungsplan folgt demnächst
  </div>

  <script>
    this.vplan = {
      head: {
        title: ""
      }
    }

    let indexThreshold = 0

    this.on('mount', () => {
      const head = this.refs.head
      const table = this.refs.table
      const progress = this.refs.progress
      const notification = this.refs.notification

      axios(`/api/${this.opts.queue}?type=teachers`)
        .then(res => {
          this.vplan = res.data

          console.log(this.vplan.body)

          head.hidden = false
          table.hidden = false
          progress.hidden = false

          this.update()
        })
        .catch(err => {
          console.log(err)

          if (err.response) {
            console.log(err.response)
            notification.hidden = false
          }
        })
    })

    this.on('updated', () => {
      const head = this.refs.head
      const table = this.refs.table
      const progress = this.refs.progress
      const notification = this.refs.notification

      const getOuterHeight = (el) =>
        el.offsetHeight + parseFloat(getComputedStyle(el)['margin-top'].match(/\d+/g)[0]) + parseFloat(getComputedStyle(el)['margin-bottom'].match(/\d+/g)[0])

      const isTableOverflowing = () => ((getOuterHeight(head) + getOuterHeight(table) + getOuterHeight(progress)) > window.innerHeight)

      for (let [index, entry] of this.vplan.body.entries()) {
        if (index < indexThreshold) continue
        if (isTableOverflowing()) continue

        const entryRow = document.createElement('tr')
        entryRow.innerHTML = `
              <td>${entry.new_teacher}</td>
              <td>${entry.lesson}</td>
              <td>${entry.class}</td>
              <td>${entry.new_subject}</td>
              <td>${entry.new_room}</td>
              <td>${entry.subject}</td>
              <td>${entry.teacher}</td>
              <td>${entry.info}</td>
            `
        table.tBodies[0].appendChild(entryRow)

      }
      if (isTableOverflowing()) table.tBodies[0].deleteRow(table.tBodies[0].rows.length - 1)

      console.log(indexThreshold, table.tBodies[0].rows.length, this.vplan.body.length - 1)

      indexThreshold += table.tBodies[0].rows.length
      if (indexThreshold >= this.vplan.body.length - 1) indexThreshold = 0

      setTimeout(() => {
        table.tBodies[0].innerHTML = ''
        this.update()
      }, 9000)

      window.vplan = this.vplan
      window.table = table
      window.head = head
      window.progress = progress
      window.getOuterHeight = getOuterHeight
    })







  </script>
</vplan-teachers-column>