"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService, type AdminUser } from "@/services/admin.service";
import { useAuthStore } from "@/stores/auth-store";
import { fullName } from "@/lib/format";
import type { Role } from "@/types/user";
import { toast } from "sonner";

const ROLES: { value: Role; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "MENTOR", label: "Mentor" },
  { value: "SUPER_ADMIN", label: "Admin" },
];

const roleLabel = (role: Role) => ROLES.find((r) => r.value === role)?.label ?? role;

const emptyDraft = { email: "", firstName: "", lastName: "", phone: "", role: "MENTOR" as Role };

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editDraft, setEditDraft] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const openEditor = (user: AdminUser) => {
    setEditing(user);
    setEditDraft({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
      phone: user.phone ?? "",
    });
  };

  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: adminService.listUsers });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const create = useMutation({
    mutationFn: () =>
      adminService.createUser({
        email: draft.email.trim(),
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        ...(draft.phone.trim() ? { phone: draft.phone.trim() } : {}),
        role: draft.role,
      }),
    onSuccess: (user) => {
      refresh();
      toast.success(`${fullName(user)} added — they sign in with an emailed code`);
      setDraft(emptyDraft);
      setAdding(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't create that account"),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      role?: Role;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    }) => adminService.updateUser(id, input),
    onSuccess: () => {
      refresh();
      setEditing(null);
      toast.success("Updated");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't update that account"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      refresh();
      toast.success("Account deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that account"),
  });

  // Deleting cascades through everything they produced, so the warning is explicit and
  // points at deactivate as the reversible option.
  const handleDelete = (user: AdminUser) => {
    if (
      confirm(
        `Permanently delete ${fullName(user)} (${user.email})?\n\n` +
          "This also deletes their enrolments, progress, feedback and uploads. It cannot be undone.\n\n" +
          "Deactivate instead if you only want to revoke access.",
      )
    ) {
      remove.mutate(user.id);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeading title="People" description="Everyone with an account. Admins can add mentors and other admins." />
        <Button onClick={() => setAdding(true)} className="w-fit self-end">
          <UserPlus className="size-4" />
          Add a person
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <EmptyState icon={Users} title="No accounts yet" description="Add your first mentor or admin." />
      )}

      <div className="mt-4 flex flex-col gap-3">
        {users?.map((user) => {
          const isSelf = me?.id === user.id;
          return (
            <Card key={user.id} className={user.isActive ? undefined : "opacity-60"}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{fullName(user)}</p>
                    <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"} className="text-[10px]">
                      {roleLabel(user.role)}
                    </Badge>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px]">
                        You
                      </Badge>
                    )}
                    {!user.isActive && (
                      <Badge variant="outline" className="text-[10px]">
                        Deactivated
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                    {user.role === "MENTOR" && ` · ${user.cohortCount} cohort${user.cohortCount === 1 ? "" : "s"}`}
                    {user.role === "STUDENT" && ` · ${user.cohortCount} enrolled`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* An admin can't change their own role or lock themselves out. */}
                  <select
                    value={user.role}
                    disabled={isSelf || update.isPending}
                    onChange={(e) => update.mutate({ id: user.id, role: e.target.value as Role })}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEditor(user)} aria-label={`Edit ${fullName(user)}`}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf || update.isPending}
                    onClick={() => update.mutate({ id: user.id, isActive: !user.isActive })}
                    className={user.isActive ? "text-destructive hover:bg-destructive/10" : undefined}
                  >
                    {user.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSelf || remove.isPending}
                    onClick={() => handleDelete(user)}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${fullName(user)}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit person</DialogTitle>
            <DialogDescription>
              Changing the email also changes where their sign-in code is sent.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="editFirstName">
              <Input
                id="editFirstName"
                value={editDraft.firstName}
                onChange={(e) => setEditDraft({ ...editDraft, firstName: e.target.value })}
              />
            </FormField>
            <FormField label="Last name" htmlFor="editLastName">
              <Input
                id="editLastName"
                value={editDraft.lastName}
                onChange={(e) => setEditDraft({ ...editDraft, lastName: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="editEmail">
            <Input
              id="editEmail"
              type="email"
              value={editDraft.email}
              onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
            />
          </FormField>

          <FormField label="Phone (optional)" htmlFor="editPhone">
            <Input
              id="editPhone"
              type="tel"
              value={editDraft.phone}
              onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </FormField>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() =>
                editing &&
                update.mutate({
                  id: editing.id,
                  firstName: editDraft.firstName.trim(),
                  lastName: editDraft.lastName.trim(),
                  email: editDraft.email.trim(),
                  phone: editDraft.phone.trim(),
                })
              }
              disabled={
                update.isPending ||
                !editDraft.firstName.trim() ||
                !editDraft.lastName.trim() ||
                !editDraft.email.trim()
              }
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a person</DialogTitle>
            <DialogDescription>
              No password is set. They sign in from the login page with a code emailed to this address.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                value={draft.firstName}
                onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                placeholder="John"
              />
            </FormField>
            <FormField label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                value={draft.lastName}
                onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                placeholder="Doe"
              />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="john@example.com"
            />
          </FormField>

          <FormField label="Phone (optional)" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </FormField>

          <FormField label="Role" htmlFor="role">
            <select
              id="role"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => create.mutate()}
              disabled={
                create.isPending || !draft.email.trim() || !draft.firstName.trim() || !draft.lastName.trim()
              }
            >
              Add person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
