import { createRoot } from 'react-dom/client';
import React, {useEffect, useState, useRef, useContext, createContext} from 'react';
import { createBrowserRouter, RouterProvider, Link, useParams } from 'react-router-dom';
import { Centrifuge } from 'centrifuge';

const CentrifugeContext = createContext(null);

function UserImage({ user }) {
  return (
    <img src={user.image_url} width='18' title={user.email} />
  );
}

function NewTopic() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(
      '/api/topics', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: { message }})
      })
      .then(res => {
        console.log({ res });
        e.target.reset();
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type='text' placeholder="New topic" />
    </form>
  );
}

function Topics() {
  const limit = 5;
  const [topics, setTopics] = useState([]);
  const centrifuge = useContext(CentrifugeContext);

  useEffect(() => {
    if (!centrifuge) return;
    const sub = centrifuge.newSubscription('topics');
    // console.log({sub});
    sub.on('publication', function (ctx) {
      // console.log('publication:', { ctx });
      setTopics(a => [ctx.data.topic, ...a.slice(0, limit -1)]);
    }).on('subscribing', function (ctx) {
      console.log('subscribing:', { ctx });
    }).on('subscribed', function (ctx) {
      console.log('subscribed:', { ctx });
    }).on('unsubscribed', function (ctx) {
      console.log('unsubscribed:', { ctx });
    }).subscribe();

    return () => centrifuge.removeSubscription(sub);
  }, [centrifuge]);

  useEffect(() => {
    fetch(`/api/topics?limit=${limit}`)
      .then(res => res.json())
      .then((topics) => {
        setTopics(topics);
      });
  }, []);

  const lists = (
    topics.map((topic) => {
      return (
        <li key={topic._id}>
          { topic.user && <UserImage user={topic.user} /> }&nbsp;
          <Link to={`/topics/${topic._id}`}>{ topic.message }</Link>
        </li>
      );
    })
  );

  return (
    <>
      <ul>
        <li key='new'><NewTopic /></li>
        { lists }
      </ul>
    </>
  );
}

function NewComment({ topic }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(
      `/api/topics/${topic._id}/comments`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name=csrf-token]').getAttribute('content'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: { message }})
      })
      .then(res => {
        console.log({ res });
        e.target.reset();
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type='text' placeholder="comment" />
    </form>
  );
}

function Topic() {
  const { _id } = useParams();
  const [topic, setTopic] = useState();
  const [comments, setComments] = useState([]);
  const centrifuge = useContext(CentrifugeContext);

  useEffect(() => {
    if (!centrifuge) return;
    const sub = centrifuge.newSubscription(`topics/${_id}`);
    sub.on('publication', function (ctx) {
      setComments(a => [...a, ctx.data.comment]);
    }).subscribe();

    return ()  => { centrifuge.removeSubscription(sub); };
  }, [centrifuge]);

  useEffect(() => {
    fetch(`/api/topics/${_id}`).then(res => res.json()).then((topic) => setTopic(topic));
    fetch(`/api/topics/${_id}/comments`).then(res => res.json()).then((comments) => setComments(comments));
  }, []);

  const lists = (
    comments.map((comment) => {
      return (
        <li key={comment._id}>
          { comment.user && <UserImage user={comment.user} /> }
          { comment.message }
        </li>
      );
    })
  );

  return (
    <>
      <Link to='/'>Topics</Link>
      <hr/>
      <div>
        {
          topic && (
            <>
              <UserImage user={topic.user} />
              { topic.message }
            </>
          )
        }
      </div>
      <ul>
        { lists }
        <li key='new'><NewComment {...{topic}} /></li>
      </ul>
    </>
  );
}

function App() {
  const [counter, setCounter] = useState(0);
  const [centrifuge, setCentrifuge] = useState();

  useEffect(() => {
    async function getToken() {
      const res = await fetch('/api/centrifugo/token');
      const data = await res.json();
      console.log({data});
      return data.token;
    }

    const host = document.getElementsByName('centrifugo-host')[0].content;
    const centrifuge = new Centrifuge(`${host}/connection/websocket`, { getToken });
    setCentrifuge(centrifuge);
    centrifuge.on('connecting', function (ctx) {
      console.log('connecting:', { ctx });
    }).on('connected', function (ctx) {
      console.log('connected:', { ctx });
    }).on('disconnected', function (ctx) {
      console.log('disconnected:', { ctx });
    }).connect();
  }, []);

  const router = createBrowserRouter([
    { path: '/', element: <Topics /> },
    { path: '/topics/:_id', element: <Topic /> },
  ]);

  return (
    <CentrifugeContext.Provider value={centrifuge}>
      <RouterProvider router={router} />
    </CentrifugeContext.Provider>
  );
}

createRoot(document.getElementById('react-root')).render(<App />);
