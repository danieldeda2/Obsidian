const POLYGON_API_KEY = process.env.REACT_APP_POLYGON_API_KEY || ''; // Use environment variable
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Check if API key is configured
if (!POLYGON_API_KEY) {
  console.warn('⚠️ POLYGON API key not found. Please add REACT_APP_POLYGON_API_KEY to your .env file');
}

// Search for stock symbols (autocomplete)
export const searchStocks = async (query) => {
  try {
    if (!POLYGON_API_KEY) {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `${POLYGON_BASE_URL}/v3/reference/tickers?search=${query}&active=true&limit=10&apiKey=${POLYGON_API_KEY}`
    );
    const data = await response.json();
    
    console.log('Polygon search response:', data);
    
    if (data.results && data.results.length > 0) {
      return data.results.map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        type: stock.type || 'Stock'
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
    // Get previous close for comparison
    const prevCloseResponse = await fetch(
      `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
    );
    const prevCloseData = await prevCloseResponse.json();
    
    console.log('Polygon previous close:', prevCloseData);
    
    if (!prevCloseData.results || prevCloseData.results.length === 0) {
      throw new Error('No quote data available');
    }
    
    const result = prevCloseData.results[0];
    const change = result.c - result.o;
    const changePercent = ((change / result.o) * 100);
    
    return {
      symbol: symbol,
      price: result.c, // close price
      change: change,
      changePercent: changePercent,
      high: result.h,
      low: result.l,
      open: result.o,
      previousClose: result.o,
      volume: result.v
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};

// Get company profile (fundamentals)
export const getCompanyOverview = async (symbol) => {
  try {
    // Get ticker details
    const detailsResponse = await fetch(
      `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    );
    const details = await detailsResponse.json();
    
    console.log('Polygon ticker details:', details);
    
    if (!details.results) {
      throw new Error('No company data available');
    }
    
    const company = details.results;
    
    // Get financials if available (requires paid plan)
    let financials = {};
    try {
      const financialsResponse = await fetch(
        `${POLYGON_BASE_URL}/vX/reference/financials?ticker=${symbol}&limit=1&apiKey=${POLYGON_API_KEY}`
      );
      const financialsData = await financialsResponse.json();
      
      if (financialsData.results && financialsData.results.length > 0) {
        const latest = financialsData.results[0];
        financials = {
          revenue: latest.financials?.income_statement?.revenues?.value || 'N/A',
          netIncome: latest.financials?.income_statement?.net_income_loss?.value || 'N/A',
          eps: latest.financials?.income_statement?.basic_earnings_per_share?.value || 'N/A',
          totalAssets: latest.financials?.balance_sheet?.assets?.value || 'N/A'
        };
      }
    } catch (err) {
      console.warn('Financials not available (may require paid plan):', err);
    }

    return {
      symbol: symbol,
      name: company.name || symbol,
      description: company.description || 'N/A',
      sector: company.sic_description || 'N/A',
      industry: company.sic_description || 'N/A',
      marketCap: company.market_cap || 'N/A',
      peRatio: 'N/A', // Requires additional calculation or paid tier
      eps: financials.eps || 'N/A',
      dividendYield: 'N/A', // Not directly available
      profitMargin: 'N/A', // Requires calculation
      beta: 'N/A', // Not directly available from Polygon
      country: company.locale || 'US',
      currency: company.currency_name || 'USD',
      exchange: company.primary_exchange || 'N/A',
      ipo: company.list_date || 'N/A',
      logo: company.branding?.icon_url ? `${company.branding.icon_url}?apiKey=${POLYGON_API_KEY}` : '',
      phone: company.phone_number || '',
      weburl: company.homepage_url || '',
      address: company.address ? `${company.address.address1 || ''}, ${company.address.city || ''}, ${company.address.state || ''}` : 'N/A'
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
      `${POLYGON_BASE_URL}/v2/reference/news?ticker=${symbol}&published_utc.gte=${from}&published_utc.lte=${to}&limit=10&apiKey=${POLYGON_API_KEY}`
    );
    const data = await response.json();
    
    console.log('Polygon news response:', data);
    
    if (data.results) {
      return data.results.map(article => ({
        headline: article.title,
        summary: article.description,
        url: article.article_url,
        source: article.publisher?.name || 'Unknown',
        datetime: new Date(article.published_utc).getTime() / 1000,
        image: article.image_url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
};

// Get historical candles (for charts)
export const getHistoricalData = async (symbol, resolution = 'day', daysBack = 30) => {
  try {
    const to = new Date();
    const from = new Date(to.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    // Format dates as YYYY-MM-DD
    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];
    
    // Polygon uses different timespan values: minute, hour, day, week, month, quarter, year
    const timespan = resolution === 'D' ? 'day' : resolution.toLowerCase();
    
    console.log(`Fetching Polygon aggregates: ${symbol} from ${fromDate} to ${toDate}`);
    
    const response = await fetch(
      `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/range/1/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('403 Forbidden - Check your Polygon.io API key and plan limits');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Polygon aggregates response:', data);

    if (data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        timestamp: new Date(item.t), // Polygon uses milliseconds timestamp
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v
      }));
    }
    
    if (data.resultsCount === 0) {
      console.warn('No historical data available for this symbol and time range');
      return [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Get real-time quote (requires paid plan)
export const getRealTimeQuote = async (symbol) => {
  try {
    const response = await fetch(
      `${POLYGON_BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results) {
      return {
        price: data.results.p,
        size: data.results.s,
        timestamp: new Date(data.results.t)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching real-time quote:', error);
    return null;
  }
};