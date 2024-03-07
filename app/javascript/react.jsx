import { createRoot } from 'react-dom/client';
import React, {useEffect, useState, useRef} from 'react';
import { Centrifuge } from 'centrifuge';

function App() {
  const [counter, setCounter] = useState(0);
  const [sub, setSub] = useState(0);

  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE3MTAwMzEyNDEsImlhdCI6MTcwOTQyNjQ0MX0.955MUnrCT4mWUIGn-fZpm8Ku0Dz29DxCUzF1LYSB78Y';
    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTAwMzE3OTUsImlhdCI6MTcwOTQyNjk5NX0.0akB3KFuzYGvkSygIihbCevxcMNeKi7RrPOHVTHU6fI';
    const centrifuge = new Centrifuge("ws://localhost:8000/connection/websocket", {token});
    centrifuge.on('connecting', function (ctx) {
      console.log('connecting:', { ctx });
    }).on('connected', function (ctx) {
      console.log('connected:', { ctx });
    }).on('disconnected', function (ctx) {
      console.log('disconnected:', { ctx });
    }).connect();

    const sub = centrifuge.newSubscription("channel");

    sub.on('publication', function (ctx) {
      console.log('publication:', { ctx });
      setCounter(ctx.data.value);
    }).on('subscribing', function (ctx) {
      console.log('subscribing:', { ctx });
    }).on('subscribed', function (ctx) {
      console.log('subscribed:', { ctx });
    }).on('unsubscribed', function (ctx) {
      console.log('unsubscribed:', { ctx });
    }).subscribe();
    setSub(sub);
  }, []);

  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    // console.log({ message });
    // sub.publish({ message });
    fetch(
      '/topics', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: { message }})
      })
      .then(res => {
        console.log({ res });
      });
  };

  console.log('before return');
  return (
    <>
      <p>counter: {counter}</p>
      <form onSubmit={handleSubmit}>
        <input ref={inputRef} type='text' />
      </form>
    </>
  );
}

const root = createRoot(document.getElementById('react-root'));
root.render(<App />);
