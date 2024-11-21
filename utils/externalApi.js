import axios from 'axios';
import Tender from '../models/Tender.js';

export const fetchAndStoreTenders = async () => {
  try {
    const { data } = await axios.get('https://api.example.com/tenders');
    const formattedTenders = data.map(tender => ({
      title: tender.title,
      description: tender.description,
      category: tender.category,
      organization: tender.organization,
      deadline: new Date(tender.deadline),
      apiId: tender.id,
    }));
    await Tender.insertMany(formattedTenders, { ordered: false });
    console.log('Tenders updated successfully');
  } catch (error) {
    console.error('Error fetching tenders:', error);
  }
};
