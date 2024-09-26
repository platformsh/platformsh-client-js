import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Invitation } from "../src/model/Invitation";

describe("Invitation", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get invitation", async () => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations/1`, {
      id: "1"
    });

    await Invitation.get("project_id", "1").then(invitation => {
      assert.equal(invitation.id, "1");
      assert.equal(invitation.constructor.name, "Invitation");
    });
  });

  it("Get invitations", async () => {
    const invitations = [
      { state: "pending", id: "1" },
      { state: "pending", id: "2" },
      { state: "pending", id: "3" }
    ];

    fetchMock.mock(`${api_url}/projects/project_id/invitations`, invitations);

    await Invitation.query("project_id").then(invitation => {
      assert.equal(invitation.length, 3);
      assert.equal(invitation[1].id, "2");
      assert.equal(invitation[1].projectId, "project_id");
      assert.equal(invitation[1].state, "pending");
      assert.equal(invitation[0].constructor.name, "Invitation");
    });
  });

  it("Delete invitation", async () => {
    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {
        id: "1",
        projectId: "projectId"
      },
      { method: "GET" }
    );

    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {},
      { method: "DELETE" }
    );

    await Invitation.get("project_id", "1").then(async invitation => {
      await invitation.delete();
    });
  });

  it("Create invitation", async () => {
    fetchMock.mock(
      `${api_url}/projects/project_id/invitations`,
      {},
      { method: "POST" }
    );

    const invitation = new Invitation({
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    await invitation.save();
  });

  it("Create and delete invitation", async () => {
    fetchMock.mock(
      `${api_url}/projects/project_id/invitations`,
      {
        id: "1"
      },
      { method: "POST" }
    );

    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {},
      { method: "DELETE" }
    );

    const invitation = new Invitation({
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    const res = await invitation.save();

    const invite = new Invitation({
      id: res.data.id,
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    await invite.delete();
  });
});
