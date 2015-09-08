/**
 * vector_layer.js
 * The is the base object for all vector based layers. This includes WFS
 * and SOS for now
 *
 *
 *
 *
 **/

gisportal.Vector = function(options) {
   console.log("creating vector layer");
   console.log(options);
   var vector = this;

   var defaults = {
      serviceType: null, // currently either SOS or WFS
      endpoint: null, // service enpoint URL
      dataType: null, // one of (point|polygon|line)
      exBoundingBox: null, // bounding box of layer
      providerTag: null, //short provider name
      serviceVersion: null, // version of OGC service
      variableName: null, // the WFS variable name
      srsName: 'EPSG:4326', // SRS for teh vector layer
      defaultStyle: new ol.style.Style({
         stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
         })
      })
   };


   $.extend(true, this, defaults, options);

   this.selected = false;

   /**
    * By default the layer is visible, to hide it
    * just call layer.setVisibility(false);
    *
    * @param {boolean} visibility - True if visible, false if hidden
    */
   this.isVisible = true;
   this.setVisibility = function(visibility) {
      if (this.openlayers['anID']) this.openlayers['anID'].setVisible(visibility);
      this.isVisible = visibility;
   };

   this.init = function() {
      console.log('initialiseing"');
   };


var buildLoader = function($vector) {
    return function(extent, resolution, projection) {
      console.log('inside loader');
        vectorSource = this;
        var url = $vector.endpoint +
            '?service=WFS' +
            '&version=1.1.0' +
            '&request=GetFeature' +
            '&typename=' + $vector.variableName +
            '&srs=' + $vector.srsName +
            '&bbox=' + extent ;
        $.ajax({
            url: url
        })
        .done(function(response) {
            vectorSource.addFeatures(vectorSource.readFeatures(response));
        });
    };
};
   /**
    * This function creates an Open Layers layer, such as a WMS Layer.
    * These are stored in layer.openlayers. Currently the implementation
    * only allows a single OL layer per gisportal.layer known as 'anID'
    * but in the future this should change to allow multiple OL layers.
    *
    * opLayers refer to operational layers, generally temporal WMS layers
    * refLayers refer to reference layers, generally WFS or KML.
    *
    * History:
    * The previous implementation had the idea of microlayers but over time
    * they grew into a confusing mess than has now been removed and merged
    * with gisportal.layer. 
    */
   this.createOLLayer = function() {
      var vec = this;
      if (this.serviceType === 'WFS') {

         console.log("================================");
         var sourceVector = new ol.source.Vector({
            loader: buildLoader(vec),
            strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({})),
         });



         var layerVector = new ol.layer.Vector({
            source: sourceVector,
            style: new ol.style.Style({
               stroke: new ol.style.Stroke({
                  color: 'rgba(0, 0, 255, 1.0)',
                  width: 2
               })
            })
         });

         return layerVector;



      }

      if (this.serviceType === 'SOS') {
         // TODO custom support for rendering SOS
      }


   };

   this.addOLLayer = function(layer, id) {
      map.addLayer(layer);
   };

   this.removeOLLayer = function(layer, id) {
      map.removeLayer(layer);
   };

   this.loadFeatures = function(reponse) {
      console.log("attempting to load features into");
      formatWFS = ol.format.WFS();
      var features = formatWFS.readFeatures(response);
      for (var i = 0; i < features.length; i++) {
         features[i].getGeometry().applyTransform(function(coords, coords2, stride) {
            for (var j = 0; j < coords.length; j += stride) {
               var y = coords[j];
               var x = coords[j + 1];
               coords[j] = x;
               coords[j + 1] = y;
            }
         });
      }
      this.sourcevector.addFeatures(features);
   };

   return this;

};