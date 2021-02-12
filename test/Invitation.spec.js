/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Invitation from "../src/model/Invitation";

describe("Invitation", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations/1`, {
      id: "1"
    });

    Invitation.get("project_id", "1").then(invitation => {
      assert.equal(invitation.id, "1");
      assert.equal(invitation.constructor.name, "Invitation");
      done();
    });
  });

  it("Get invitations", done => {
    const invitations = [
      { state: "pending", id: "1" },
      { state: "pending", id: "2" },
      { state: "pending", id: "3" }
    ];

    fetchMock.mock(`${api_url}/projects/project_id/invitations`, invitations);

    Invitation.query("project_id").then(invitation => {
      assert.equal(invitation.length, 3);
      assert.equal(invitation[1].id, "2");
      assert.equal(invitation[1].projectId, "project_id");
      assert.equal(invitation[1].state, "pending");
      assert.equal(invitation[0].constructor.name, "Invitation");
      done();
    });
  });

  it("Delete invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations/1`, {
      id: "1",
      projectId: "projectId"
    });

    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {},
      "DELETE"
    );

    Invitation.get("project_id", "1").then(invitation => {
      invitation.delete().then(result => {
        done();
      });
    });
  });

  it("Create invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations`, {}, "POST");

    const invitation = new Invitation({
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    invitation.save().then(() => done());
  });

  it("Create and delete invitation", async () => {
    fetchMock.mock(
      `${api_url}/projects/project_id/invitations`,
      {
        id: "1"
      },
      "POST"
    );

    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {},
      "DELETE"
    );

    const invitation = new Invitation({
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    const res = await invitation.save();

    const invit = new Invitation({
      id: res.data.id,
      projectId: "project_id",
      environments: [],
      role: "view",
      inviteeEmail: "test@psh.com"
    });

    await invit.delete();
  });
});
