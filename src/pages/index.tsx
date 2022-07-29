import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrismicDocument } from '@prismicio/types';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination?.results || [])
  const [nextPage, setNextPage] = useState<string | null>(postsPagination.next_page)

  const loadMorePosts = async() => {
    try {
      console.log("carregando")
      const response = await fetch(nextPage, { method: "GET" }).then(response => response.json())
  
      const newPosts: Post[] = response.results.map((post: PrismicDocument) => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          author: post.data.author,
          subtitle: post.data.subtitle,
        }
      }))
  
      setNextPage(response.next_page)
      setPosts(prev => [...prev, ...newPosts])
    } catch (error) {
      alert("não foi possível carregar mais posts")
    }
  }

  return(
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>
      <main className={ styles.container }>
        <section>
          { posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={ styles.postCard }>
                <h1>{ post.data.title }</h1>
                <p>{ post.data.subtitle }</p>
                <div>
                  <p>
                    <FiCalendar/> 
                    { format(
                      new Date(post.first_publication_date), 
                      "dd MMM yyyy",
                      {
                        locale: ptBR
                      }
                    ) }
                  </p>
                  <p>
                    <FiUser/> 
                    { post.data.author }
                  </p>
                </div>
              </a>
            </Link>
          )) }
        </section>
        { !!nextPage &&
          <footer>
            <button onClick={ loadMorePosts } className={ styles.loadPostsButton }>
              <strong>Carregar mais posts</strong>
            </button>
          </footer>
        }
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType("posts", {
    fetch: [
      "posts.title",
      "posts.subtitle",
      "posts.author"
    ],
    pageSize: 2
  });

  const posts: Post[] = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      author: post.data.author,
      subtitle: post.data.subtitle,
    }
  }))

  return {
    props: { 
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    },
    revalidate: 60 * 30 //30min
  }
};
