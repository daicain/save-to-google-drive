var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var path = require('path');
var prettysize = require('prettysize');
var progressStream = require('progress-stream');
var crypto = require('crypto');
var prettyTime = require('pretty-time');
var Email = require('./Email');

module.exports = {
    lists: (req, res, next) => {
        req.service.files.list({
            pageSize: 10,
            // fields: " files(id, name,corpus)"
        }, (err, response)=> {
            if (err) {
                console.log(err);
                return res.json(req.error("Error while fetching lists from drive"));
            }
            var dir = _.where(response.files, {mimeType: 'application/vnd.google-apps.folder'});
            return res.json(req.success(dir));
        });
    },
    upload: (req, res)=> {
        email = new Email();
        if (req.query.email) {
            email.setFrom("Samundra Kc");
            email.setTo(req.query.email);
            email.init();
        }

        var current_client;
        if (req.cookies.id) {
            current_client = _.findWhere(clientLists, {id: req.cookies.id});
        }

        if (!req.query.url) {
            return res.json(req.error("No any url found"));
        }

        var decodedURIName =decodeURIComponent(path.basename(req.query.url));
        var googleRequestMetaData = {
            url: ' https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers: {
                Authorization : "Bearer " + req.cookies.access_token.access_token
            },
        }

        var progress = progressStream({
            time: 1000
        }, progress => {
            var per = Math.round(progress.percentage);
            progress.percentage = per;
            progress.transferred = prettysize(progress.transferred);
            progress.remaining = prettysize(progress.remaining);
            progress.speed = prettysize(progress.speed) + "ps";
            if (progress.eta)
                progress.eta = prettyTime(progress.eta * 1000000000);
            current_client.emit('upload', {progress, fileId});
        });
        var fileId = undefined;
        var metaData = {};

        //First we visit the url
        var requestStream;
        try {
            requestStream = request.get(req.query.url);
        }
        catch (err) {
            emitMessage(current_client, "Wrong format of url or incomplete url", "warning");
            return res.json(req.error("Wrong format of url or incomplete url"));
        }
        requestStream
            .on('error', err => {
                console.log(err)
                return res.json(req.error("Invalid urls"));
            })
            .on('response', response => {
                //On Response we create headers and upload the file
                googleRequestMetaData.headers = _.extendOwn(googleRequestMetaData.headers,response.headers);
                googleRequestMetaData.headers["Authorization"] = "Bearer " + req.cookies.access_token.access_token;
                if (response.statusCode == 200) {
                    var metaData = response.headers;
                    metaData.name = decodeURIComponent(path.basename(req.query.url));
                    metaData.size = prettysize(response.headers['content-length'], true, true);
                    metaData.hash = crypto.createHmac('sha256', 'samundrakc').update(response.headers.name + Date.now()).digest('hex');
                    fileId = response.headers.hash;
                    res.json(req.success(metaData));
                    emitMessage(current_client, "File from url has been found, Uploading to Google Drive", "success");
                    progress.setLength(response.headers['content-length']);
                }
                else {
                    emitMessage(current_client, "This Url doesn't provide direct download " + decodedURIName, "danger");
                    return res.json(req.error("This Url doesn't provide direct download"));
                }
                googleRequestMetaData.headers = _.pick(googleRequestMetaData.headers, 'Authorization', 'content-type', 'content-length');
            })
            .pipe(progress)
            .pipe(request.post(googleRequestMetaData, (err, status, result)=> {
                // console.log(err,status,result)
                if (err) {
                    emitMessage(current_client, "Error uploading File of " + decodedURIName, "danger");
                    if (req.query.email) {
                        email.setSubject("Error uploading file");
                        email.setMessage("File you requested to upload to google drive from " + decodedURIName + " has been failed, You can try to upload file again");
                        email.send();
                    }
                    console.log(err);
                    return;
                }

                result = JSON.parse(result);
                if (result.hasOwnProperty('error')) {
                    emitMessage(current_client, "Error uploading File from " + decodedURIName, "danger");
                    emitMessage(current_client,result.errors.message + " Please authenticate again","warning");
                    if (req.query.email) {
                        email.setSubject("Error uploading file");
                        email.setMessage("File you requested to upload to google drive of " + decodedURIName + " has been failed, You can try to upload file again. Error message is " + result.error.message);
                        email.send();
                    }
                    return;
                }
                //After file has been upload we rename it
                var updation = {
                    url: 'https://www.googleapis.com/drive/v3/files/' + result.id,
                    method: 'PATCH',
                    headers: {
                        "Authorization": googleRequestMetaData.headers['Authorization'],
                        'Content-Type': 'application/json'
                    },
                    json: {
                        fileId: result.id,
                        name: decodeURIComponent(path.basename(req.query.url)),
                        mimeType: googleRequestMetaData.headers['content-type'],
                    }
                }
                emitMessage(current_client, "File has been uploaded proccessing is going on", "success");
                request(updation, (err, result) => {
                    if (err) {
                        console.log(err);
                        emitMessage(current_client, "Error uploading file of url " + decodedURIName, "danger");
                        if (req.query.email) {
                            email.setSubject("Error uploading file");
                            email.setMessage("File you requested to upload to google drive from " + decodedURIName + " has been failed, You can try to upload file again.");
                            email.send();
                        }
                        return;
                    }


                    if (result.hasOwnProperty('error')) {
                        console.log(result.error)
                        emitMessage(current_client, "Error uploading one file " + decodedURIName, "danger");
                        if (req.query.email) {
                            email.setSubject("Error uploading file");
                            email.setMessage("File you requested to upload to google drive from  " + decodedURIName + " has been failed, You can try to upload file again. Error message is " + result.error.message);
                            email.send();
                        }
                        return;
                    }

                    emitMessage(current_client, "1 File has been uploaded ", "success");
                    if (req.query.email) {
                        email.setSubject("File Uploaded");
                        email.setMessage("File you requested to upload to google drive of " + decodedURIName + " has been uploaded succesfully");
                        email.send();
                    }
                });
            }));

    }
}

function emitMessage(socket, message, type) {
    socket.emit('userMessage', {message, type})
}