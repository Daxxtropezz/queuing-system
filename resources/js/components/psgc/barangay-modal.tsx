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
  psgc_prov: string | number;
  psgc_mun: string | number;
  mun_name: string;
}
interface Barangay {
  psgc_reg: string | number;
  psgc_prov: string | number;
  psgc_mun: string | number;
  psgc_brgy: string | number;
  brgy_name: string;
}

interface BarangayModalProps {
  barangay?: Barangay | null;
  provinces: Province[];
  regions: Region[];
  citymuns: Citymun[];
  isModalVisible: boolean;
  onClose: () => void;
}

const BarangayModal: React.FC<BarangayModalProps> = ({
  barangay,
  provinces,
  regions,
  citymuns,
  isModalVisible,
  onClose,
}) => {
  const isCreate = !barangay;

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
    psgc_brgy: string;
    brgy_name: string;
  }>({
    psgc_reg: barangay?.psgc_reg?.toString() ?? "",
    psgc_prov: barangay?.psgc_prov?.toString() ?? "",
    psgc_mun: barangay?.psgc_mun?.toString() ?? "",
    psgc_brgy: barangay?.psgc_brgy?.toString() ?? "",
    brgy_name: barangay?.brgy_name ?? "",
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

  // Filter citymuns by selected province
  const filteredCitymuns = useMemo(
    () =>
      data.psgc_prov
        ? citymuns.filter(
            (mun) => mun.psgc_prov.toString() === data.psgc_prov.toString()
          )
        : citymuns,
    [data.psgc_prov, citymuns]
  );

  // Reset form on open/close or barangay change
  useEffect(() => {
    if (barangay) {
      setData({
        psgc_reg: barangay.psgc_reg?.toString() ?? "",
        psgc_prov: barangay.psgc_prov?.toString() ?? "",
        psgc_mun: barangay.psgc_mun?.toString() ?? "",
        psgc_brgy: barangay.psgc_brgy?.toString() ?? "",
        brgy_name: barangay.brgy_name ?? "",
      });
    } else {
      reset();
    }
    clearErrors();
    // eslint-disable-next-line
  }, [barangay, isModalVisible]);

  // Reset province/citymun when region/province changes
  useEffect(() => {
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
      setData("psgc_mun", "");
    }
    // eslint-disable-next-line
  }, [data.psgc_reg, provinces]);

  useEffect(() => {
    if (
      data.psgc_prov &&
      data.psgc_mun &&
      citymuns.find(
        (mun) =>
          mun.psgc_mun.toString() === data.psgc_mun.toString() &&
          mun.psgc_prov.toString() === data.psgc_prov.toString()
      ) === undefined
    ) {
      setData("psgc_mun", "");
    }
    // eslint-disable-next-line
  }, [data.psgc_prov, citymuns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post("/barangay", {
        onSuccess: () => {
          Swal.fire("Success!", "Barangay has been created.", "success");
          onClose();
        },
        onError: () => {
          Swal.fire("Error!", "There was a problem creating the barangay.", "error");
        },
      });
    } else {
      put(`/barangay/${barangay?.psgc_brgy}`, {
        onSuccess: () => {
          Swal.fire("Success!", "Barangay has been updated.", "success");
          onClose();
        },
        onError: () => {
          Swal.fire("Error!", "There was a problem updating the barangay.", "error");
        },
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Limit PSGC Brgy to 10 digits
  const limitPsgcBrgy = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toString();
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setData("psgc_brgy", value);
  };

  return (
    <Dialog open={isModalVisible} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Barangay" : "Edit Barangay"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill in the details to create a new barangay."
              : "Edit the barangay details below."}
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
          {/* City/Municipality */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="psgc_mun" className="text-left">
              City/Municipality
            </Label>
            <Select
              onValueChange={(value) => setData("psgc_mun", value)}
              value={data.psgc_mun}
              disabled={processing || !data.psgc_prov}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a city/municipality" />
              </SelectTrigger>
              <SelectContent>
                {filteredCitymuns && filteredCitymuns.length > 0 ? (
                  filteredCitymuns.map((citymun) => (
                    <SelectItem key={citymun.psgc_mun} value={citymun.psgc_mun.toString()}>
                      {citymun.mun_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No city/municipality available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.psgc_mun && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.psgc_mun}
              </p>
            )}
          </div>
          {/* PSGC Barangay */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="psgc_brgy" className="text-left">
              Barangay Code
            </Label>
            <Input
              id="psgc_brgy"
              type="number"
              value={data.psgc_brgy}
              onChange={limitPsgcBrgy}
              className="col-span-3"
              disabled={processing}
            />
            {errors.psgc_brgy && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.psgc_brgy}
              </p>
            )}
          </div>
          {/* Barangay Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brgy_name" className="text-left">
              Barangay Name
            </Label>
            <Input
              id="brgy_name"
              value={data.brgy_name}
              onChange={(e) => setData("brgy_name", e.target.value)}
              className="col-span-3"
              maxLength={100}
              disabled={processing}
            />
            {errors.brgy_name && (
              <p className="col-span-4 text-left text-sm text-red-500">
                {errors.brgy_name}
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

export default BarangayModal;