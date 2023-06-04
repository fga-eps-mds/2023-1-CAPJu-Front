import { useQuery } from "react-query";

import { PrivateLayout } from "layouts/Private";
import { getUsersRequests, getAcceptedUsers } from "services/user";
import { Requests } from "./Requests";
import { Profiles } from "./Profiles";

function ProfilesManager() {
  const {
    data: usersData,
    isFetched: isUsersFetched,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["accepted-users"],
    queryFn: getAcceptedUsers,
  });
  const {
    data: requestsData,
    isFetched: isRequestsFetched,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: getUsersRequests,
  });

  return (
    <PrivateLayout>
      <Requests
        requestsData={requestsData}
        isRequestsFetched={isRequestsFetched}
        refetchRequests={() => {
          refetchRequests();
          refetchUsers();
        }}
      />
      <Profiles
        usersData={usersData}
        isUsersFetched={isUsersFetched}
        refetchUsers={() => {
          refetchRequests();
          refetchUsers();
        }}
      />
    </PrivateLayout>
  );
}

export default ProfilesManager;
