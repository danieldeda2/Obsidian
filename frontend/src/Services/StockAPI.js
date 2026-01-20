const FINNHUB_KEY = 'd5nkpn1r01ql6sfs6020d5nkpn1r01ql6sfs602g'; // Replace with your key
const BASE_URL = 'https://finnhub.io/api/v1';

// Search for stock symbols (autocomplete)
export const searchStocks = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&token=${FINNHUB_KEY}`
    );
    const data = await response.json();
    
    if (data.result) {
      return data.result.map(stock => ({
        ticker: stock.symbol,
        name: stock.description,
        type: stock.type
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

// Get stock quote (current price)
export const getStockQuote = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    const data = await response.json();
    
    return {
      symbol: symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};

// Get company profile (fundamentals)
export const getCompanyOverview = async (symbol) => {
  try {
    // Company profile
    const profileResponse = await fetch(
      `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    const profile = await profileResponse.json();

    // Basic financials
    const financialsResponse = await fetch(
      `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`
    );
    const financials = await financialsResponse.json();

    return {
      symbol: symbol,
      name: profile.name || symbol,
      description: profile.finnhubIndustry || 'N/A',
      sector: profile.finnhubIndustry || 'N/A',
      industry: profile.finnhubIndustry || 'N/A',
      marketCap: profile.marketCapitalization || 'N/A',
      peRatio: financials.metric?.peBasicExclExtraTTM || 'N/A',
      eps: financials.metric?.epsBasicExclExtraItemsTTM || 'N/A',
      dividendYield: financials.metric?.dividendYieldIndicatedAnnual || 'N/A',
      profitMargin: financials.metric?.netProfitMarginTTM || 'N/A',
      beta: financials.metric?.beta || 'N/A',
      country: profile.country || 'N/A',
      currency: profile.currency || 'USD',
      exchange: profile.exchange || 'N/A',
      ipo: profile.ipo || 'N/A',
      logo: profile.logo || '',
      phone: profile.phone || '',
      weburl: profile.weburl || ''
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return null;
  }
};

// Get company news
export const getCompanyNews = async (symbol) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const from = lastWeek.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const response = await fetch(
      `${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );
    const news = await response.json();
    
    return news.slice(0, 10); // Return top 10 news items
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
};

// Get historical candles (for charts)
export const getHistoricalData = async (symbol, resolution = 'D', daysBack = 30) => {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (daysBack * 24 * 60 * 60);

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );
    const data = await response.json();

    if (data.s === 'ok') {
      return data.t.map((timestamp, index) => ({
        timestamp: new Date(timestamp * 1000),
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index]
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};