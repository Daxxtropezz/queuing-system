import React, { useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Region {
  psgc_reg: string | number;
  reg_name: string;
}
interface Province {
  psgc_reg: string | number;
  psgc_prov: string | number;
  prov_name: string;
}
interface Citymun {
  psgc_reg: string | number;
  psgc_prov: string | number;
  psgc_mun: string | number;
  mun_name: string;
}

interface CitymunModalProps {
  citymun?: Citymun | null;
  provinces: Province[];
  regions: Region[];
  isModalVisible: boolean;
  onClose: () => void;
}

const CitymunModal: React.FC<CitymunModalProps> = ({
  citymun,
  provinces,
  regions,
  isModalVisible,
  onClose,
}) => {
  const isCreate = !citymun;

  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
    clearErrors,
  } = useForm<{
    psgc_reg: string;
    psgc_prov: string;
    psgc_mun: string;
    mun_name: string;
  }>({
    psgc_reg: citymun?.psgc_reg?.toString() ?? "",
    psgc_prov: citymun?.psgc_prov?.toString() ?? "",
    psgc_mun: citymun?.psgc_mun?.toString() ?? "",
    mun_name: citymun?.mun_name ?? "",
  });

  // Filter provinces by selected region
  const filteredProvinces = useMemo(
    () =>
      data.psgc_reg
        ? provinces.filter(
            (prov) => prov.psgc_reg.toString() === data.psgc_reg.toString()
          )
        : provinces,
    [data.psgc_reg, provinces]
  );

  // Reset form on open/close or citymun change
  useEffect(() => {
    if (citymun) {
      setData({
        psgc_reg: citymun.psgc_reg?.toString() ?? "",
        psgc_prov: citymun.psgc_prov?.toString() ?? "",
        psgc_mun: citymun.psgc_mun?.toString() ?? "",
        mun_name: citymun.mun_name ?? "",
      });
    } else {
      reset();
    }
    clearErrors();
    // eslint-disable-next-line
  }, [citymun, isModalVisible]);

  // Reset province when region changes
 useEffect(() => {
  // Only reset province if the selected province does not belong to the selected region
  if (
    data.psgc_reg &&
    data.psgc_prov &&
    provinces.find(
      (prov) =>
        prov.psgc_prov.toString() === data.psgc_prov.toString() &&
        prov.psgc_reg.toString() === data.psgc_reg.toString()
    ) === undefined
  ) {
    setData("psgc_prov", "");
  }
  // eslint-disable-next-line
}, [data.psgc_reg, provinces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post("/citymun", {
        onSuccess: () => {
          Swal.fire("Success!", "City/Municipality has been created.", "success");
          onClose();
        },
        onError: () => {
          Swal.fire("Error!", "There was a problem creating the city/municipality.", "error");
        },
      });
    } else {
      put(`/citymun/${citymun?.psgc_mun}`, {
        onSuccess: () => {
          Swal.fire("Success!", "City/Municipality has been updated.", "success");
          onClose();
        },
        onError: () => {
          Swal.fire("Error!", "There was a problem updating the city/municipality.", "error");
        },
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Limit PSGC Mun to 10 digits
  const limitPsgcMun = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toString();
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setData("psgc_mun", value);
  };

  return (
    <Dialog open={isModalVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create City/Municipality" : "Edit City/Municipality"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill in the details to create a new city/municipality."
              : "Edit the city/municipality details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Region */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="psgc_reg" className="text-left">
              Region
            </Label>
            <Select
              onValueChange={(value) => setData("psgc_reg", value)}
              value={data.psgc_reg}
              disabled={processing}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions && regions.length > 0 ? (
                  regions.map((region) => (
                    <SelectItem key={region.psgc_reg} value={region.psgc_reg.toString()}>
                      {region.reg_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No regions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.psgc_reg && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.psgc_reg}
              </p>
            )}
          </div>
          {/* Province */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="psgc_prov" className="text-left">
              Province
            </Label>
            <Select
              onValueChange={(value) => setData("psgc_prov", value)}
              value={data.psgc_prov}
              disabled={processing || !data.psgc_reg}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {filteredProvinces && filteredProvinces.length > 0 ? (
                  filteredProvinces.map((province) => (
                    <SelectItem key={province.psgc_prov} value={province.psgc_prov.toString()}>
                      {province.prov_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No provinces available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.psgc_prov && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.psgc_prov}
              </p>
            )}
          </div>
          {/* PSGC Mun */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="psgc_mun" className="text-left">
              City/Municipality PSGC Code
            </Label>
            <Input
              id="psgc_mun"
              type="number"
              value={data.psgc_mun}
              onChange={limitPsgcMun}
              className="col-span-3"
              disabled={processing}
            />
            {errors.psgc_mun && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.psgc_mun}
              </p>
            )}
          </div>
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mun_name" className="text-left">
              City/Municipality Name
            </Label>
            <Input
              id="mun_name"
              value={data.mun_name}
              onChange={(e) => setData("mun_name", e.target.value)}
              className="col-span-3"
              maxLength={100}
              disabled={processing}
            />
            {errors.mun_name && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.mun_name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? "Saving..." : isCreate ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CitymunModal;