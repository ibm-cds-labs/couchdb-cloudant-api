(function() {
  var apiFileUrl = 'https://raw.githubusercontent.com/ibm-watson-data-lab/couchdb-cloudant-api/master/cloudant-couchdb-api-ref.json'
  var apiResources = []

  var scrollUp = function() {
    //scroll really fast
    var keepScrolling = window.setInterval(function() {
      var pos = window.pageYOffset
      if (pos > 0) {
        window.scrollTo(0, pos - 1000)
      }
      else {
        window.clearInterval(keepScrolling);
      }
    }, 5)
  }

  window.addEventListener('DOMContentLoaded', function () {
    Vue.filter('highlight', function (value) {
      if (value) {
        value = value.replace(/<[^>]*>/gi, ' ')
        app.apiDatabases.forEach(function(db) {
          var regex = RegExp(db, 'gi')
          value = value.replace(regex, '<b>' + db + '</b>')
        })
      }
      return value
    })

    var app = new Vue({
      el: '#api',

      data: {
        total: 0,
        resources: [],
        apiMethods: [],
        apiDatabases: [],
        filteredText: '',
        filteredMethod: '',
        filteredDatabases: []
      },

      ready: function() {
        this.initResources()
      },

      methods: {
        initResources: function() {
          var _this = this
          this.$http
            .get(apiFileUrl)
            .then(function(res) {
              if (res.ok) {
                apiResources = JSON.parse(res.data)
                dbs = []
                meths = []
                apiResources.forEach(function(resource) {
                  if (meths.indexOf(resource.method) === -1) {
                    meths.push(resource.method)
                  }
                  if (resource.database && resource.database.length > 0) {
                    if (typeof resource.database === 'string') {
                      resource.database = [resource.database]
                    }
                    resource.database.forEach(function(db) {
                      if (dbs.indexOf(db) === -1) {
                        dbs.push(db)
                      }
                    })
                  }
                  if (resource.comment && resource.comment.indexOf('\n') > 0) {
                    resource.comment = resource.comment.split('\n')
                  }
                  else {
                    resource.comment = [resource.comment]
                  }
                })
                app.total = apiResources.length
                app.resources = apiResources
                app.apiDatabases = dbs
                app.apiMethods = meths
              }
            })
        },

        filterDatabase: function(db) {
          if (db) {
            var index = app.filteredDatabases.indexOf(db)
            if (index === -1) {
              app.filteredDatabases.push(db)
            }
            else {
              app.filteredDatabases.splice(index, 1)
            }
            app.refreshResources()
          }
        },

        filterMethod: function(meth) {
          if (meth) {
            if (app.filteredMethod === meth) {
              app.filteredMethod = ''
            }
            else {
              app.filteredMethod = meth
            }
            app.refreshResources()
          }
        },

        refreshResources: function() {
          app.resources = apiResources.filter(function(resource) {
            var inMeth = false
            var inDb = false
            var inText = false

            if (app.filteredMethod) {
              inMeth = app.filteredMethod === resource.method
            }
            else {
              inMeth = true
            }

            if (app.filteredDatabases.length > 0) {
              if (resource.database.length >= app.filteredDatabases.length) {
                inDb = app.filteredDatabases.every(function(db) {
                  return resource.database.indexOf(db) > -1
                })
              }
              else {
                inDb = false
              }
            }
            else {
              inDb = true
            }

            if (app.filteredText) {
              var t = app.filteredText.toLowerCase()
              inText = resource.endpoint.toLowerCase().indexOf(t) > -1
                || resource.summary.toLowerCase().indexOf(t) > -1
                || resource.comment.join(' ').toLowerCase().indexOf(t) > -1
            }
            else {
              inText = true
            }

            return inMeth && inDb && inText
          })

          scrollUp()
        }
      }
    })
  })    
}())
