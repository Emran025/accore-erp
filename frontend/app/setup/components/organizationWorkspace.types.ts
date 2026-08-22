import { MetaType, OrgNode } from "../types";

export type OrganizationLink = {
  id: number;
  source_node_uuid: string;
  target_node_uuid: string;
  link_type?: string;
};

export type OrganizationWorkspaceNode = OrgNode & {
  outgoing_links?: OrganizationLink[];
  incoming_links?: OrganizationLink[];
};

export type OrganizationMetaType = Omit<MetaType, "attributes"> & {
  level_domain?: string;
  description?: string;
  attributes?: Array<{ attribute_key: string; is_mandatory: boolean; attribute_type?: string }>;
};

export type OrganizationTopologyRule = {
  id: number;
  source_node_type_id: string;
  target_node_type_id: string;
  cardinality: string;
  description?: string;
};

export type OrganizationIntegrityIssue = {
  type: "ERROR" | "WARNING" | "INFO";
  message: string;
  node_uuid?: string;
  node_type_id?: string;
};

export type OrganizationIntegrity = {
  issues: OrganizationIntegrityIssue[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info?: number;
  };
};

export type OrganizationNodeDraft = {
  node_type_id: string;
  code: string;
  attributes: Record<string, unknown>;
  links: Array<{
    target_node_uuid: string;
    validate_constraints: true;
  }>;
};

export type OrganizationWorkspacePhase = "foundation" | "core_operations" | "extensions";
