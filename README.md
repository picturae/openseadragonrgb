# OpenSeadragonRGB

An OpenSeadragon plugin to allow reading the rgb values of image pixels.

## Usage

Include `dist/openseadragonrgb.js` after OpenSeadragon in your html. Then after you create a viewer:

    var rgbPlugin = viewer.rgb(options);

### Options

    viewer.selection({
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
