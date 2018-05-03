<vplan-head>
  <h2 class="title is-2 margin-2">{ vplan.head.title }</h2>

  <script>
    this.getData = async () => {
        axios(`/api/${this.opts.queue}?type=students`)
          .then(_ => {
            this.vplan = _.data
            this.update()
            console.log(this.vplan)
          })
          .catch(err => {
            if (err.response) {
              console.log(err.response)
            }
          })

      }
      this.getData()



  </script>
</vplan-head>