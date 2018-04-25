<vplan-table>
  <table class="table is-fullwidth is-bordered is-striped is-hoverable">
    <thead>
      <th>Klasse</th>
      <th>Stunde</th>
      <th>Fach</th>
      <th>Lehrer</th>
      <th>Raum</th>
      <th>Info</th>
    </thead>
    <tr>
      <td>Hello</td>
      <td>World</td>
    </tr>
    <tr>
      <td>How are</td>
      <td>you</td>
    </tr>
  </table>

  <script>
    axios('/api/current?type=students')
      .then(_ => console.table(_.data))


  </script>
</vplan-table>