import { useQuery } from "react-query";
import { useState } from "react";
import { PrivateLayout } from "layouts/Private";
import { getUsersRequests, getAcceptedUsers } from "services/user";
import { Requests } from "./Requests";
import { Profiles } from "./Profiles";

function ProfilesManager() {
  const [filter] = useState<string>("");
  const {
    data: usersData,
    isFetched: isUsersFetched,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["accepted-users"],
    queryFn: async () => {
      const res = await getAcceptedUsers(filter);

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
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
