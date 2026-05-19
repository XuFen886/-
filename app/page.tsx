'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]);

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // 邮箱注册/登录
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('注册成功！请查收邮箱验证');
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert('登录成功！');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 发帖
  const createPost = async () => {
    if (!content || !user) return alert('请先登录并输入内容');
    
    const { error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content });
    
    if (error) alert(error.message);
    else {
      setContent('');
      alert('发帖成功！');
      fetchPosts();
    }
  };

  // 获取帖子
  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>我的社交平台</h1>
      
      {!user ? (
        <div>
          <h2>登录 / 注册</h2>
          <input 
            type="email" 
            placeholder="邮箱" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', width: '100%', margin: '10px 0' }}
          />
          <input 
            type="password" 
            placeholder="密码" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', width: '100%', margin: '10px 0' }}
          />
          <button onClick={signIn} style={{ marginRight: '10px' }}>登录</button>
          <button onClick={signUp}>注册</button>
        </div>
      ) : (
        <div>
          <p>已登录：{user.email}</p>
          <button onClick={signOut}>退出</button>

          <h2>发新帖</h2>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天想说点什么..."
            style={{ width: '100%', height: '100px', padding: '10px' }}
          />
          <button onClick={createPost}>发布</button>
        </div>
      )}

      <h2>最新帖子</h2>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
          <p>{post.content}</p>
          <small>发布时间：{new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}