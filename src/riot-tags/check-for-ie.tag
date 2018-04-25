<check-for-ie>
  <script>
    function getInternetExplorerVersion() {
      let rV = -1 // Return value assumes failure.

      if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName === 'Netscape') {
        const uA = navigator.userAgent
        const rE = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})')

        if (rE.exec(uA) != null) {
          rV = parseFloat(RegExp.$1)
        }
        /* check for IE 11 */
        else if (navigator.userAgent.match(/Trident.*rv\:11\./)) {
          rV = 11
        }
      }
      return rV
    }
    const ieVersion = getInternetExplorerVersion()
    if (ieVersion !== -1) {
      alert(`Bitte verwenden Sie einen anderen Browser als Internet Explorer ${ieVersion}`)
    }  
  </script>
</check-for-ie>