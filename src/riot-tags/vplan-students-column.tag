<vplan-students-column>
  <div ref="head" style="margin-top: 5px; margin-bottom: 10px" hidden>
    <h2 class="title is-2">{ vplan.head.title }</h2>
  </div>

  <table ref="table" class="table is-fullwidth is-narrow is-striped" hidden>
    <thead>
      <th>Klasse</th>
      <th>Stunde</th>
      <th>Fach</th>
      <th>Lehrer</th>
      <th>Raum</th>
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

    this.render = () => {
      const head = this.refs.head
      const table = this.refs.table
      const progress = this.refs.progress
      const notification = this.refs.notification

      table.tBodies[0].innerHTML = ''

      const getOuterHeight = (el) =>
        el.offsetHeight + parseFloat(getComputedStyle(el)['margin-top'].match(/\d+/g)[0]) + parseFloat(getComputedStyle(el)['margin-bottom'].match(/\d+/g)[0])

      const isTableOverflowing = () => ((getOuterHeight(head) + getOuterHeight(table) + getOuterHeight(progress)) > window.innerHeight)

      for (let [index, entry] of this.vplan.body.entries()) {
        if (index < indexThreshold) continue
        if (isTableOverflowing()) continue

        const entryRow = document.createElement('tr')
        entryRow.innerHTML = `
              <td>${entry.class}</td>
              <td>${entry.lesson}</td>
              <td>${entry.subject}</td>
              <td>${entry.teacher}</td>
              <td>${entry.room}</td>
              <td>${entry.info}</td>
            `
        table.tBodies[0].appendChild(entryRow)
      }
      if (isTableOverflowing()) table.tBodies[0].deleteRow(table.tBodies[0].rows.length - 1)

      console.log(indexThreshold, table.tBodies[0].rows.length, this.vplan.body.length)

      indexThreshold += table.tBodies[0].rows.length
      if (indexThreshold >= this.vplan.body.length) indexThreshold = 0
    }

    this.on('mount', () => {
      const head = this.refs.head
      const table = this.refs.table
      const progress = this.refs.progress
      const notification = this.refs.notification

      axios(`/api/${this.opts.queue}?type=students`)
        .then(res => {
          this.vplan = res.data

          // console.log(this.vplan.body)

          head.hidden = false
          table.hidden = false
          progress.hidden = false

          // prerender
          let pagesNeeded = 1
          let pageWrap = false

          this.render()
          while (!pageWrap) {
            this.render()
            pagesNeeded++
            if (indexThreshold === 0) pageWrap = true
          }
          console.log(pagesNeeded)

          this.update()
        })
        .catch(err => {
          if (err.response) {
            notification.hidden = false
          }
        })
    })

    this.on('updated', () => {
      this.render()

      setTimeout(() => {
        this.update()
      }, 9000)
    })






  </script>
</vplan-students-column>