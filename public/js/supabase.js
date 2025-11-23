import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 替换为你的Supabase项目信息（必须修改！）
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证模块
export const Auth = {
  // 注册
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 登录
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // 退出登录
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  },

  // 监听用户状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// 文章模块
export const Posts = {
  // 获取已发布的文章列表
  async getPublishedPosts(limit = 10, page = 1) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url,
            bio
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { posts: data, total: count, error: null };
    } catch (error) {
      return { posts: [], total: 0, error };
    }
  },

  // 获取单篇文章详情
  async getPostById(id) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { post: data, error: null };
    } catch (error) {
      return { post: null, error };
    }
  },

  // 创建文章
  async createPost(postData) {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('请先登录');

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...postData,
          author_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return { post: data, error: null };
    } catch (error) {
      return { post: null, error };
    }
  },

  // 更新文章
  async updatePost(id, postData) {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('请先登录');

      const { data, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)
        .eq('author_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { post: data, error: null };
    } catch (error) {
      return { post: null, error };
    }
  },

  // 删除文章
  async deletePost(id) {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// 评论模块
export const Comments = {
  // 获取文章的评论
  async getCommentsByPostId(postId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { comments: data, error: null };
    } catch (error) {
      return { comments: [], error };
    }
  },

  // 创建评论
  async createComment(commentData) {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('请先登录');

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          ...commentData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return { comment: data, error: null };
    } catch (error) {
      return { comment: null, error };
    }
  },

  // 删除评论
  async deleteComment(id) {
    try {
      const user = await Auth.getCurrentUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// 用户模块
export const Users = {
  // 更新用户资料
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // 获取用户资料
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }
};