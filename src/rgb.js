(function($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonRGB requires OpenSeadragon version 2.0.0+');
    }

    $.Viewer.prototype.rgb = function(options) {
        if (!this.rgbInstance || options) {
            options = options || {};
            options.viewer = this;
            this.rgbInstance = new $.RGB(options);
        }
        return this.rgbInstance;
    };

    /**
    * @class RGB
    * @classdesc Allows access to RGB values of pixels
    * @memberof OpenSeadragon
    * @param {Object} options
    */
    $.RGB = function ( options ) {

        $.extend( true, this, {
            // internal state properties
            viewer:                  null,

            // options
            onCanvasHover:             null,
            sampleSize:              1,
        }, options );

        if (this.onCanvasHover) {
            this.tracker = new $.MouseTracker({
                element:            this.viewer.canvas,
                moveHandler:        $.delegate( this, onMouseMove ),
            });
        }
    };

    $.extend( $.RGB.prototype, /** @lends OpenSeadragon.RGB.prototype */{
        /**
         * Get RGB values of cancas coordinates
         * @method
         * @param {OpenSeadragon.Point} canvasX the point in canvas coordinate system.
         * @param {Number} canvasX X coordinate in canvas coordinate system.
         * @param {Number} canvasY Y coordinate in canvas coordinate system.
         * @return {Object|false} An object containing r,g,b properties or false if this is not supported.
         */
        getValueAt: function( canvasX, canvasY ) {
            var point = arguments.length === 1 ? canvasX : new $.Point(canvasX, canvasY);
            var viewer = this.viewer;
            var result = viewer.drawer.getRgbAt(point);
            if (result) {
                var image;
                var imagePoint;
                var size;
                for (var i = 0; i < viewer.world.getItemCount(); i++) {
                    image = viewer.world.getItemAt(i);
                    size = image.getContentSize();
                    if ($.TiledImage.prototype.viewerElementToImageCoordinates) {
                        imagePoint = image.viewerElementToImageCoordinates(point);
                    } else {
                        // older version
                        imagePoint = viewer.viewport.viewerElementToImageCoordinates(point);
                    }
                    if (imagePoint.x >= 0 && imagePoint.y >= 0 && imagePoint.x <= size.x && imagePoint.y <= size.y) {
                        // point is inside an image
                        result.image = image;
                        result.imageCoordinates = imagePoint;
                    }
                }
            }
            return result;
        },

          getValueAround: function( canvasX, canvasY ) {
              var center = arguments.length === 1 ? canvasX : new $.Point( canvasX, canvasY) ;
              var viewer = this.viewer;

              var images = [];
              for (var i = 0; i < viewer.world.getItemCount(); i++) {
                  images.push( viewer.world.getItemAt(i) );
              }

              var image;
              for (var i = 0; i < images.length; i++) {
                  image = images[i];
                  if ( viewer.drawer.pointIsInImage( center, image ) ) {
                      break;
                  }
              }

              var eyeDrop = viewer.drawer.getEyeDrop( center, viewer.rgbInstance.sampleSize );
              var colors = [];
              for (var i = 0; i < eyeDrop.length; i++) {
                  colors.push( viewer.drawer.getRgbAt( eyeDrop[i] ) );
              }

              var reds = [], greens = [], blues = [], alphas = [];
              for (var i = 0; i < colors.length; i++) {
                  reds.push( colors[i].r );
                  greens.push( colors[i].g );
                  blues.push( colors[i].b );
                  alphas.push( colors[i].a );
              }
              var getMedian = function ( channelValues ) {
                  channelValues.sort( function( a, b ) {return a - b; } );
                  var median = channelValues[Math.floor( channelValues.length / 2 )];
                  console.log( 'channelValues ' + JSON.stringify( channelValues ) +  ' median: ' + JSON.stringify( median ) );
                  return median;
              };
              var color = {
                  r: getMedian(reds),
                  g: getMedian(greens),
                  b: getMedian(blues),
                  a: getMedian(alphas),
              };

              console.log( 'color ' + JSON.stringify( color ) );

              if ( image ) {
                  color.image = image;
                  color.imageCoordinates = center;
              }
              return color;
         },
    });

    function onMouseMove(event) {
        this.onCanvasHover(this.getValueAround(event.position));
    }

    /**
     * Test existence of imagepoint
     * @method
     * @param {OpenSeadragon.Point} point the coordinate.
     * @return {Boolean} true when point is inside image.
     */
    $.Drawer.prototype.pointIsInImage = function( point, image ) {
        var size = image.getContentSize();
        var pointIsInImage = point.x >= 0 && point.y >= 0;
        pointIsInImage = pointIsInImage && point.x <= size.x && point.y <= size.y;
        return pointIsInImage;
    };

    /**
     * Get RGB values of canvas coordinates
     * @method
     * @param {OpenSeadragon.Point} point the point in image coordinate system.
     * @return {Object|false} An object containing r,g,b properties or false if this is not supported.
     */
    $.Drawer.prototype.getRgbAt = function(point) {
        if (!this.useCanvas) {
            return false;
        }
        var ratio = $.pixelDensityRatio;
        var color = this._getContext()
                        .getImageData(point.x * ratio, point.y * ratio, 1, 1).data; // rgba e [0,255]
        return {
            r: color[0],
            g: color[1],
            b: color[2],
            a: color[3]
        };
    };

    /**
     * Get Points within a range
     * @method
     * @param {OpenSeadragon.Point} center the point mousepointed at.
     * @return {Array} All the points within the eyedrop.
     */
    $.Drawer.prototype.getEyeDrop = function( center, sampleSize ) {
        var points = [];
        var plusmin = ( sampleSize - 1 ) / 2;
        for (var x = 0 - plusmin; x <= plusmin; x++) {
            for (var y = 0 - plusmin; y <= plusmin; y++) {
                var point = new $.Point( center.x + x, center.y + y );
                if ( center.distanceTo( point ) <= plusmin ) {
                    points.push( point );
                }
            }
        }
        return points;
    };

})(OpenSeadragon);
