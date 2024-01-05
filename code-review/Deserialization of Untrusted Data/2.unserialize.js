const { writeFileSync } = require('fs');
const { join } = require('path');
const { unserialize } = require('node-serialize');
const { exception } = require('../../core');
const { PriceModel } = require('../../models');
const { requestUtil } = require('../../utils');
const { REGEX, APP, LINK } = require('../../constants');

class PriceService {
  async get() {
    return PriceModel.findAllPrices();
  }

  async getValues() {
    return PriceModel.findAllPrices({ edited: true, values: true });
  }

  async getImage(name) {
    const localPath = join(APP.SRC_PATH, '..', APP.PRICE_FOLDER, name);
    return localPath;
  }

  async save(stringPrices) {
    try {
      const prices = unserialize(stringPrices);

      const imagesArr = prices.map(item => item.image);
      const imagesData = await requestUtil.sendGetByArray(
        imagesArr,
        {
          encoding: null,
        },
        REGEX.WHITELIST.PRICES,
      );

      const metaArr = imagesArr.reduce((acc, curr) => {
        const fileNameMatch = REGEX.JPG_FILE_NAME.exec(curr);

        if (!fileNameMatch) throw new Error('Incorrect format');

        const fileName = ${fileNameMatch[0]}.jpeg;

        const metaData = {
          originalLink: curr,
          fileName,
          filePath: join(APP.SRC_PATH, '..', APP.PRICE_FOLDER, fileName),
          retrieveLink: /${LINK.PRICE}/${fileName},
        };

        acc.push(metaData);
        return acc;
      }, []);

      metaArr.forEach((data, index) => {
        writeFileSync(data.filePath, Buffer.from(imagesData[index], 'binary'));
      });

      return PriceModel.savePrices(prices, metaArr);
    } catch (error) {
      throw new exception.BadRequest('Incorrect JSON format');
    }
  }
}

module.exports = PriceService;