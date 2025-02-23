const CommunityDetails = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityDetails();
  }, [communityId]);

  const fetchCommunityDetails = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}`);
      const data = await response.json();
      setCommunity(data);
      setActiveChannel(data.channels[0]);
    } catch (error) {
      console.error("Failed to fetch community details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
      <div className="col-span-2 bg-background border-r">
        <div className="p-4">
          <h2 className="font-semibold mb-4">{community.name}</h2>
          <div className="space-y-1">
            {community.channels.map((channel) => (
              <Button
                key={channel._id}
                variant={
                  channel._id === activeChannel?._id ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                onClick={() => setActiveChannel(channel)}
              >
                <Hash className="h-4 w-4 mr-2" />
                {channel.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-7 bg-background">
        <CommunityChat channel={activeChannel} />
      </div>

      <div className="col-span-3 bg-background border-l">
        <UserList
          users={community.members}
          onlineUsers={[]} // This would come from your socket connection
        />
      </div>
    </div>
  );
};
