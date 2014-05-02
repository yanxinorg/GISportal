// Options currently requires a title
gisportal.graphs.data = function(params, options)  {
   var request = $.param( params );    

   function success(data) {
      console.log('Data for graph creation received successfully');
      gisportal.graphs.create(data, options);
   }
      
   function error(request, errorType, exception) {
      var data = {
         type: 'wcs data',
         request: request,
         errorType: errorType,
         exception: exception,
         url: this.url
      };          
      gritterErrorHandler(data);
   }

   gisportal.genericAsync('GET', gisportal.wcsLocation + request, null, success, error, 'json', null);
}

gisportal.graphs.create = function(data, options)  {
   if (data.error !== "") {
      var d = { error: data.error };
      gisportal.gritter.showNotification('graphError', d);
      return;
   }

   var graph;
   switch (data.type)  {
      case 'timeseries':
         graph = gisportal.graphs.timeseries(data, options);
         break;
      case 'histogram':
         debugger;
         graph = gisportal.graphs.histogram(data, options);
         break;
      case 'hovmollerLat':
         break;
      case 'hovmollerLon':
         break;
   }

   if (graph)  {
      var uid = 'wcsgraph' + Date.now();
      var title = options.title || "Graph";
      $('li[data-id="'+data.coverage+'"]').append(graph);
   } 
}
