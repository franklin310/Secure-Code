"use strict";
import libxml from 'libxmljs';
import request from 'request';
const feedUrl = "https://www.w3schools.com/xml/note.xml";

export function showFeeds(req, res){
    request(feedUrl, function (error, response, body) {
        if(error)
            return res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'});
        const doc = libxml.Document.fromXml(body, {
            noblanks: true,
            noent: false,
            nocdata: true
        });
        const result = doc.toString();
        if(doc.errors && doc.errors.length)
            return res.status(HTTP_STATUS.ERROR).send({message: 'Something went wrong.'});
        return res.status(HTTP_STATUS.SUCCESS).send({content: result});

    });
}