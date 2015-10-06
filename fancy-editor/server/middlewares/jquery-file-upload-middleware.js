/**
 * Created by chuso_000 on 19/9/2015.
 */

var path = require('path');
var upload = require('jquery-file-upload-middleware');
upload.configure({
    uploadDir: path.join(__dirname, '/../../public/uploads'),
    uploadUrl: '/uploads',
    imageVersions: {
        thumbnail: {
            width: 500,
            height: 400
        }
    }
});
module.exports = function (app) {
    app.get('/upload', function( req, res ){
        res.redirect('/');
    });

    app.put('/upload', function( req, res ){
        res.redirect('/');
    });

    app.delete('/upload', function( req, res ){
        res.redirect('/');
    });

    app.use('/upload', upload.fileHandler());
};
