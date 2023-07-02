import { PrivateLayout } from "layouts/Private";
import { Requests } from "./Requests";
import { Profiles } from "./Profiles";

function ProfilesManager() {
  return (
    <PrivateLayout>
      <Requests />
      <Profiles />
    </PrivateLayout>
  );
}

export default ProfilesManager;
