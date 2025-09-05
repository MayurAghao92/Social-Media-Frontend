import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { captionAPI, postAPI } from "../services/api";
import { Upload, Wand2, Heart, Trash2, Camera, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Layout/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [customCaption, setCustomCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postAPI.getAllPosts();

      const postsFromAPI = response.data || [];

      // console.log("Fetched posts:", postsFromAPI);

      const sortedPosts = postsFromAPI.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setGeneratedCaption("");
      setCustomCaption("");
    }
  };

  const generateCaption = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await captionAPI.generateCaption(formData);
      // console.log("Generated caption:", response.data.caption);
      // console.log("Full response from caption API:", response);
      // console.log("Response data:", response.data);

      setGeneratedCaption(response.data.caption);
      setCustomCaption(response.data.caption);
      toast.success("Caption generated successfully!");
    } catch (error) {
      toast.error("Failed to generate caption");
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!selectedImage || !customCaption.trim()) {
      toast.error("Please select an image and add a caption");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("caption", customCaption);

      await postAPI.createPost(formData);
      toast.success("Post created successfully!");

      // Reset form
      setSelectedImage(null);
      setImagePreview(null);
      setGeneratedCaption("");
      setCustomCaption("");

      // Refresh posts
      fetchPosts();
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      await postAPI.likePost(postId);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postAPI.deletePost(postId);
        toast.success("Post deleted successfully");
        fetchPosts();
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Post Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100 backdrop-blur-sm bg-white/90">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create New Post
            </h2>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-72 border-3 border-dashed border-gradient-to-r from-purple-300 to-pink-300 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-[1.02] group"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full p-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded-xl mx-auto shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <p className="mb-2 text-center text-lg font-semibold text-gray-700">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Generate Caption */}
          {selectedImage && (
            <div className="mb-8">
              <button
                onClick={generateCaption}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Wand2 className="w-5 h-5" />
                <span>
                  {loading ? "Generating..." : "Generate Caption with AI"}
                </span>
              </button>
            </div>
          )}

          {/* Caption Input */}
          {(generatedCaption || customCaption) && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Caption
              </label>
              <div className="relative">
                <textarea
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="Write a caption or use the AI-generated one..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gradient-to-r from-purple-50 to-pink-50 font-medium transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* Post Button */}
          {selectedImage && customCaption && (
            <button
              onClick={createPost}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              {loading ? "Creating Post..." : "Create Post ✨"}
            </button>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recent Posts
            </h2>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-purple-100">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-semibold text-gray-600 mb-2">
                No posts yet
              </p>
              <p className="text-gray-500">
                Create your first post and share it with the world! 🌟
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {/* Post Header */}
                <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {post.user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {post.user?.username}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user?._id === post.user?._id && (
                    <button
                      onClick={() => deletePost(post._id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-110"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Post Image */}
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                </div>

                {/* Post Actions */}
                <div className="p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                  <div className="flex justify-between items-center space-x-6 mb-4">
                    <button
                      onClick={() => likePost(post._id)}
                      className={`flex items-center space-x-2 font-semibold transition-all duration-300 transform hover:scale-110 ${
                        post.likes?.includes(user?._id)
                          ? "text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-7 h-7 ${
                          post.likes?.includes(user?._id) ? "fill-current" : ""
                        }`}
                      />
                      <span className="text-lg">{post.likes?.length || 0}</span>
                    </button>
                    <button
                      className="flex items-center text-gray-600 space-x-2 text-3xl font-thin transition-all hover:text-red-500 duration-300 transform hover:scale-110"
                      onClick={() => deletePost(post._id)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="bg-white rounded-xl p-4 border border-purple-100">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {post.user?.username}
                      </span>{" "}
                      {post.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
