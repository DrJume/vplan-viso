<ticker>
  <div ref="ticker" class="marquee3k" data-speed="1" hidden> 
      <span style="font-size: 3vh; font-family: monospace" class="">{ tickerTxt }</span>
  </div>

  <script>
    this.tickerTxt = ""

    this.on('mount', () => {
      const ticker = this.refs.ticker

      axios(`/api/current?type=${this.opts.type}`)
        .then(res => {
          if (res.data.ticker) {
            ticker.hidden = false
            this.tickerTxt = res.data.ticker
            this.update()
            console.log(res.data)
            Marquee3k.init()
          }
      }).catch(err => {
          console.log(err)
        })
    })
    
  </script>

  <style>
  .marquee3k__copy {
        padding-right: 30px;
        box-sizing: border-box;
    }
  </style>

</ticker>