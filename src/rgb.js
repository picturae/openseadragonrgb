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
            var center = arguments.length === 1 ? canvasX : new $.Point( canvasX, canvasY) ;
            var viewer = this.viewer;

            var images = [];
            for (var i = 0; i < viewer.world.getItemCount(); i++) {
                images.push( viewer.world.getItemAt(i) );
            }

            var image = viewer.drawer.getImageOfPoint( center, images );

            var sampleData = viewer.drawer.getRgbAt( center );
            var reds = [], greens = [], blues = [], alphas = [];
            for (var s = 0; s < sampleData.length; s = s + 4) {
                reds.push( sampleData[s] );
                greens.push( sampleData[s + 1] );
                blues.push( sampleData[s + 2] );
                alphas.push( sampleData[s + 3] );
            }
            var getMedian = function ( channelValues ) {
                channelValues.sort( function( a, b ) {return a - b; } );
                var median = channelValues[Math.floor( channelValues.length / 2 )];
                return median;
            };
            var color = {
                r: getMedian(reds),
                g: getMedian(greens),
                b: getMedian(blues),
                a: getMedian(alphas),
            };
            if ( image ) {
                color.image = image;
                color.imageCoordinates = center;
            }
            return color;
       },
    });

    function onMouseMove(event) {
        this.onCanvasHover(this.getValueAt(event.position));
    }

    /**
     * Test existence of imagepoint
     * @method
     * @param {OpenSeadragon.Point} point the coordinate.
     * @return {Image|null} the image that holds the point.
     */
    $.Drawer.prototype.getImageOfPoint = function( point, images ) {
        var image;
        for (var i = 0; i < images.length; i++) {
            var size = images[i].getContentSize();
            var imagePoint;
            if ($.TiledImage.prototype.viewerElementToImageCoordinates) {
                imagePoint = images[i].viewerElementToImageCoordinates(point);
            } else {
                // older version
                imagePoint = this.viewer.viewport.viewerElementToImageCoordinates(point);
            }
            var pointIsInImage = imagePoint.x >= 0 && imagePoint.y >= 0;
            pointIsInImage = pointIsInImage && imagePoint.x <= size.x && imagePoint.y <= size.y;
            if ( pointIsInImage ) {
                image = images[i];
                break;
            }
        }
        return image;
    };

    /**
     * Get RGB values of canvas coordinates
     * @method
     * @param {OpenSeadragon.Point} point the point in imageå coordinate system.
     * @return {imageData|false} An object containing flat r,g,b,a array plus properties or false if this is not supported.
     */
    $.Drawer.prototype.getRgbAt = function(point) {
        if (!this.useCanvas) {
            return false;
        }
        var sampleSize = this.viewer.rgbInstance.sampleSize;
        var sampleOffset = ( sampleSize - 1 ) / 2;
        var ratio = $.pixelDensityRatio;
        var x = ( point.x * ratio ) - sampleOffset;
        var y = ( point.y * ratio ) - sampleOffset;
        var renderingContext = this._getContext();
        var sampleData = renderingContext.getImageData(x, y, sampleSize, sampleSize).data; // rgba e [0,255]
        return sampleData;
    };

})(OpenSeadragon);
