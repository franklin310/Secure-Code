function parseXML(res, filename) {
    var xmlfile = path.join(__dirname, '/../uploads/', filename);

    fs.readFile(xmlfile, "utf-8", function (error, text) {
        if (error) {
            throw error;
        } else {
            var xmlDoc = libxml.parseXml(text,  {
                nonet: true,
                noent: false,
                nsclean: false,
                dtdload: false,
                dtdattr: false
            });

            if(xmlDoc.errors && xmlDoc.errors.length) {
                res.send("Parsing failed");
            } else  {
                var books = xmlDoc.childNodes();
                res.render('xml_parse', { books: books });
            }

        }
    });
}