// src/components/community/CommunityCard.jsx
const CommunityCard = ({ community, onClick }) => {
  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{community.name}</h3>
          <p className="text-sm text-muted-foreground">
            {community.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{community.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {community.members.length} members
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
