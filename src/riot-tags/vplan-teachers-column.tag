<vplan-teachers-column>
  <div ref="head" style="margin-top: 5px; margin-bottom: 10px" hidden>
    <h2 class="title is-2" style="margin-bottom: 0.8rem">{ vplan.head.title }</h2>
    <p class="is-size-4 is-italic">
      { vplan.info }
    </p>
  </div>

  <table ref="table" class="table is-fullwidth is-narrow is-striped" style="margin-bottom: 0;" hidden>
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

  <div ref="supervisionTable" style="border-top: 1px solid; padding-top: 3px; margin-top: 10px; align-self: center;" hidden></div>

  <div ref="progress" style="margin: auto 10px 15px 10px;" hidden>
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

    function insertAfter(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    let indexThreshold = 0

    this.on('mount', () => {
      const head = this.refs.head
      const table = this.refs.table
      const supervisionTable = this.refs.supervisionTable
      const progress = this.refs.progress
      const notification = this.refs.notification

      axios(`/api/${this.opts.queue}?type=teachers`)
        .then(res => {
          this.vplan = res.data

          // console.log(this.vplan.body)

          head.hidden = false
          table.hidden = false
          supervisionTable.hidden = false
          // progress.hidden = false

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
      const supervisionTable = this.refs.supervisionTable
      const progress = this.refs.progress
      const notification = this.refs.notification

      const getOuterHeight = (el) =>
        el.offsetHeight + parseFloat(getComputedStyle(el)['margin-top'].match(/\d+/g)[0]) + parseFloat(getComputedStyle(el)['margin-bottom'].match(/\d+/g)[0])

      const isTableOverflowing = () => ((getOuterHeight(head) + getOuterHeight(table) /* + getOuterHeight(progress)*/) > window.innerHeight*0.95)

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

      console.log(indexThreshold, table.tBodies[0].rows.length, this.vplan.body.length)

      const isPageOverflowing = () => ((getOuterHeight(head) + getOuterHeight(table) + getOuterHeight(supervisionTable) + getOuterHeight(progress)) > window.innerHeight)

      indexThreshold += table.tBodies[0].rows.length
      if (indexThreshold >= this.vplan.body.length - 1) {
        //indexThreshold = 0

        // append supervisionable after normal table
        supervisionTable.classList.add("is-size-4", "has-text-black")
        supervisionTable.innerHTML = `
              <table>
              ${this.vplan.supervision.map(entry => `<tr><td>${entry}</td></tr>`).join("").replace(new RegExp("-->", 'g'), `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M14 2h-7.229l7.014 7h-13.785v6h13.785l-7.014 7h7.229l10-10z"/></svg>`)}
              </table>
            `
        insertAfter(supervisionTable, table)
        console.log(getOuterHeight(head) + getOuterHeight(table) + getOuterHeight(supervisionTable) + getOuterHeight(progress))
        if (isPageOverflowing()) {
          supervisionTable.innerHTML = ''
        } else {
          indexThreshold = 0
        }
      }

      setTimeout(() => {
        table.tBodies[0].innerHTML = ''
        supervisionTable.innerHTML = ''
        this.update()
      }, 11000)

      window.getOuterHeight = getOuterHeight
    })







  </script>
</vplan-teachers-column>