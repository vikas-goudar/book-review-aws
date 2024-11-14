// src/MainPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Card from './components/Card';
import { useLocation } from 'react-router-dom';
import './index.css';


export default function MainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.query) {
      setSearchQuery(location.state.query);
      performSearch(location.state.query);
    }
  }, [location.state]);

  const performSearch = async (query) => {
    if (!query) return;

    try {
      const parameters = {
        q: query,
        key: 'AIzaSyBb_w6EWijM0kL66MeJSLS_sAggv4O7vJ8', // Replace with your actual API key
        maxResults: 16,
      };
      const params = new URLSearchParams(parameters).toString();
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${params}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const booksData = await response.json();

      if (!booksData.items) {
        console.warn('No items found in books data.');
        setBooks([]);
        return;
      }

      const booksList = [];

      booksData.items.forEach((item) => {
        const volumeInfo = item.volumeInfo || {};

        const bookData = {
          id: item.id || 'N/A',
          title: volumeInfo.title || 'N/A',
          authors: volumeInfo.authors || ['Unknown Author'],
          publisher: volumeInfo.publisher || 'Unknown Publisher',
          published_date: volumeInfo.publishedDate || 'Unknown Date',
          description: volumeInfo.description || 'No description available.',
          page_count: volumeInfo.pageCount || 'Unknown Page Count',
          categories: volumeInfo.categories || ['No categories available'],
          average_rating: volumeInfo.averageRating || 'No rating',
          ratings_count: volumeInfo.ratingsCount || 'No ratings count',
          thumbnail: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.thumbnail
            : 'https://via.placeholder.com/128x192?text=No+Image',
          small_thumbnail: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.smallThumbnail
            : 'https://via.placeholder.com/128x192?text=No+Image',
        };

        // Only include books with page count greater than 30
        if (typeof bookData.page_count === 'number' && bookData.page_count > 30) {
          booksList.push(bookData);
        }
      });

      console.log(`Number of books fetched: ${booksList.length}`);
      setBooks(booksList);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBooks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery) {
      alert('Please enter a search term!');
      return;
    }

    performSearch(searchQuery);
  };

  return (
    <>
      <Navbar />
      <form onSubmit={handleSubmit} className="flex justify-center mt-6">
        <div className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-80 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mx-20 my-10">
        {books.length > 0 ? (
          books.map((book) => (
            <Card
              key={book.id}
              id={book.id}
              title={book.title || 'No Title Available'}
              authors={book.authors ? book.authors.join(', ') : 'Unknown Author'}
              image={
                book.thumbnail
                  ? book.thumbnail
                  : 'https://via.placeholder.com/128x192?text=No+Image'
              }
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No books found.
          </div>
        )}
      </div>
    </>
  );
}
