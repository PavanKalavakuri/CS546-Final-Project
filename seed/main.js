/** @module fakexy */

const axios = require('axios');
const cheerio = require('cheerio')
const { CREDITCARDS, COUNTRIES, STATES } = require('./consts.js');

const FAKER_URL = 'https://www.fakexy.com/';

async function getHtml({ prefix, suffix, generator }) {
  const requestUrl = `${FAKER_URL}${
    prefix ? `${prefix}-` : ''
  }fake-${generator}-generator${suffix ? `-${suffix}` : ''}`;

  try {
    const response = await axios.get(requestUrl);
    const { data } = response;

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getObjectFromHtml({ html, listQuery, listItemQuery }) {
  const table = {};

  const $ = cheerio.load(html);

  const listDom = $(listQuery);
  const listElems = listDom.find(listItemQuery);

  listElems.each((i, listElem) => {
    const listItemMain = $(listElem).find(':nth-child(1)').text().trim();
    const listItemSub = $(listElem).find(':nth-child(2)').text().trim();

    table[listItemMain] = listItemSub;
  });

  return table;
}

/**
 * @typedef {Object.<string, string>} Address
 */

/**
 * Returns a random fake address.
 * @function
 * @param {{countryCode: string, stateCode: string}} [locale] - If specified, return addresses in the specified country and state
 * @returns {Address}
 */
const getAddress = async ({ countryCode, stateCode }) => {
  if (
    !COUNTRIES.includes(countryCode) ||
    (stateCode && !STATES[countryCode].includes(stateCode))
  ) {
    throw new Error('Invalid countryCode or stateCode');
  }

  const prefix = stateCode ? countryCode : '';
  const suffix = stateCode || countryCode;
  const generator = 'address';
  const html = await getHtml({ prefix, suffix, generator });

  const listQuery = '#cointainer .box:nth-of-type(1) table';
  const listItemQuery = 'tr';
  const address = await getObjectFromHtml({ html, listQuery, listItemQuery });

  return address;
};

/**
 * @typedef {Object.<string, string>} Profile
 */

/**
 * Returns a random fake profile.
 * @function
 * @param {{countryCode: string, stateCode: string}} [locale] - If specified, return profiles in the specified country and state
 * @returns {Profile}
 */
const getProfile = async ({ countryCode, stateCode }) => {
  if (
    !COUNTRIES.includes(countryCode) ||
    (stateCode && !STATES[countryCode].includes(stateCode))
  ) {
    throw new Error('Invalid countryCode or stateCode');
  }

  const prefix = stateCode ? countryCode : '';
  const suffix = stateCode || countryCode;
  const generator = 'name';
  const html = await getHtml({ prefix, suffix, generator });

  const listQuery = '#cointainer .box:nth-of-type(1) table';
  const listItemQuery = 'tr';
  const profile = await getObjectFromHtml({ html, listQuery, listItemQuery });

  return profile;
};

/**
 * @typedef {Object.<string, string>} Phonenumber
 */

/**
 * Returns a random fake phonenumber.
 * @function
 * @param {{countryCode: string, stateCode: string}} [locale] - If specified, return phonenumbers in the specified country and state
 * @returns {Phonenumber}
 */
const getPhonenumbers = async ({ countryCode, stateCode }) => {
  if (
    !COUNTRIES.includes(countryCode) ||
    (stateCode && !STATES[countryCode].includes(stateCode))
  ) {
    throw new Error('Invalid countryCode or stateCode');
  }

  const prefix = stateCode ? countryCode : '';
  const suffix = stateCode || countryCode;
  const generator = 'phonenumber';
  const html = await getHtml({ prefix, suffix, generator });

  const listQuery = '.core.ul-list';
  const listItemQuery = '.li-item';
  const phonenumbers = await getObjectFromHtml({
    html,
    listQuery,
    listItemQuery,
  });

  return phonenumbers;
};

/**
 * @typedef {Object.<string, string>} Zipcode
 */

/**
 * Returns a random fake zipcode.
 * @function
 * @param {{countryCode: string, stateCode: string}} [locale] - If specified, return zipcodes in the specified country and state
 * @returns {Zipcode}
 */
const getZipcodes = async ({ countryCode, stateCode }) => {
  if (
    !COUNTRIES.includes(countryCode) ||
    (stateCode && !STATES[countryCode].includes(stateCode))
  ) {
    throw new Error('Invalid countryCode or stateCode');
  }

  const prefix = stateCode ? countryCode : '';
  const suffix = stateCode || countryCode;
  const generator = 'zipcode';
  const html = await getHtml({ prefix, suffix, generator });

  const listQuery = '.core.ul-list';
  const listItemQuery = '.li-item';
  const zipcodes = await getObjectFromHtml({
    html,
    listQuery,
    listItemQuery,
  });

  return zipcodes;
};

/**
 * @typedef {Object} Creditcard
 */

/**
 * Returns a random fake credit card.
 * @function
 * @param {{creditcardBrand: string}} [creditcardBrand] - If specified, return a credit card with the specified brand
 * @returns {Creditcard}
 */
const getCreditcard = async ({ creditcardBrand }) => {
  if (creditcardBrand && !CREDITCARDS.includes(creditcardBrand)) {
    throw new Error('Invalid creditcard');
  }

  const prefix = '';
  const suffix = creditcardBrand || '';
  const generator = 'creditcard';
  const html = await getHtml({ prefix, suffix, generator });

  const listQuery = '#cointainer .box:nth-of-type(1) table';
  const listItemQuery = 'tr';
  const creditcards = await getObjectFromHtml({
    html,
    listQuery,
    listItemQuery,
  });

  return creditcards;
};

module.exports = {
  getAddress,
  getCreditcard,
  getPhonenumbers,
  getZipcodes,
  getProfile
};