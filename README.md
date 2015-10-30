# OpenSeadragonRGB

An OpenSeadragon plugin to allow reading the rgb values of image pixels.

## Demo

http://picturae.github.io/openseadragonselection/#openseadragonrgb

## Usage

This plugin requires the latest version of OpenSeadragon

Include `dist/openseadragonrgb.js` after OpenSeadragon in your html. Then after you create a viewer:

    var rgbPlugin = viewer.rgb(options);

### Options

    viewer.rgb({
        onCanvasHover: function(color) {},
    });

### Get values

You can get the RGBA value at an arbitrary point using viewport coordinates like this:

    var color = rgbPlugin.getValueAt(x, y);

Then `color` (wheter from `getValueAt()` or passed to the onCanvasHover callback) will contain:

    {
        r: Number, // value for Red channel
        g: Number, // value for Green channel
        b: Number, // value for Blue channel
        a: Number, // value for Alpha channel
        image: OpenSeadragon.TiledImage // image that contains this pixel if there is any
    }

## CORS

If your tiles come from a different domain, you may get this error in the console:

    Uncaught SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.

The only way to fix this is to make the tile server return the `Access-Control-Allow-Origin: *` header and pass the `crossOriginPolicy: 'Anonymous'` option to OpenSeadragon. For more info on this go to https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Origin
