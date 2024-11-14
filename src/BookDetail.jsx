// src/BookDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [name, setName] = useState("");
  const [notes, setNotes] = useState([]);

  const client = generateClient({
    authMode: "userPool",
  });
  

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        /*
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        */
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }
  useEffect(() => {
    
    
    // Fetch book details directly from Google Books API
    const fetchBook = async () => {
      try {
        const parameters = {
          key: 'AIzaSyBb_w6EWijM0kL66MeJSLS_sAggv4O7vJ8', // Replace with your actual API key
        };
        const params = new URLSearchParams(parameters).toString();
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}?${params}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const item = await response.json();

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

        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book data:', error);
      }
    };

    fetchBook();
    fetchNotes();
  }, [id]);

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Loading...</div>
      </>
    );
  }
  
    
  
    
  
    async function createNote(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      //console.log(form.get("image").name);
  
      const { data: newNote } = await client.models.Note.create({
        name: book.title,
        description: reviewText,
        rating,
      });
  
      console.log(newNote);
      /*
      if (newNote.image)
        if (newNote.image)
          await uploadData({
            path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
  
            data: form.get("image"),
          }).result;
          */
  
      fetchNotes();
      event.target.reset();
    }
  
    async function deleteNote({ id }) {
      const toBeDeletedNote = {
        id: id,
      };
  
      const { data: deletedNote } = await client.models.Note.delete(
        toBeDeletedNote
      );
      console.log(deletedNote);
  
      fetchNotes();
    }
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    console.log('Review submitted:', reviewText, rating);

    setShowReviewPopup(false);
    setReviewText('');
    setRating(1);
  };

  

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 flex">
        <div className="w-1/3">
          <img
            src={
              book.thumbnail ||
              'https://via.placeholder.com/128x192?text=No+Image'
            }
            alt={book.title}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="w-2/3 pl-10">
          <h1 className="text-4xl font-bold">
            {book.title || 'No Title Available'}
          </h1>
          <p className="text-2xl mt-4">
            By{' '}
            {book.authors ? book.authors.join(', ') : 'Unknown Author'}
          </p>
          <p className="text-lg mt-2">
            Published: {book.published_date || 'Unknown'}
          </p>
          <p className="text-base mt-6">
            {book.description || 'No description available.'}
          </p>
          <p className="text-base mt-6">
            Page Count: {book.page_count || 'Unknown'}
          </p>
          <p className="text-base mt-6">
            Average Rating: {book.average_rating || 'No rating.'}
          </p>
          <p className="text-base mt-6">
            Ratings Count: {book.ratings_count || 'No ratings count.'}
          </p>
          <p className="text-base mt-6">
            Categories:{' '}
            {book.categories ? book.categories.join(', ') : 'No categories.'}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-between mt-10">
            <button className="px-4 py-2 bg-gray-500 text-white rounded">
              Like
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setShowReviewPopup(true)}
            >
              Write a Review
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded">
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mt-10 mb-4">Reviews:</h2>
        {notes.length > 0 ? (
            notes
                .filter((note) => note.name === book.title)
                .map((note) => (
                <div key={note.id} className="border-b border-gray-300 py-4">
                    <h3 className="text-xl font-bold">{note.name}</h3>
                    <p>{note.description}</p>
                    <p>Rating: {note.rating}</p>    
                </div>
                ))
            ) : (
            <p>No reviews yet.</p>
            )}

      </div>
      {/* Review Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md relative w-1/2">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowReviewPopup(false)}
            >
              X
            </button>
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <form onSubmit={createNote}>
              <div className="mb-4">
                
                <textarea name="description"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="5"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4" name="rating">
                <label className="mr-2">Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="border border-gray-300 rounded p-1"
                >
                  {['1', '2', '3', '4', '5'].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
