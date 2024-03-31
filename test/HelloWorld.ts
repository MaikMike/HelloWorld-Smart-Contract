import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import { expect } from "chai";

describe("HelloWorld", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const contract = await hre.viem.deployContract("HelloWorld", []);
    const publicClient = await hre.viem.getPublicClient();

    return {
      contract,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe('HelloWorld', function () {
    it('should return Hello World', async function () {
      const { contract } = await loadFixture(deployFixture);

      const result = await contract.read.helloWorld();

      expect(result).to.equal('Hello World');
    });
  });

  describe('setText', function () {
    it('should set the text Bye World', async function () {
      const { contract } = await loadFixture(deployFixture);

      await contract.write.setText(['Bye World']);
      const result = await contract.read.helloWorld();

      expect(result).to.equal('Bye World');
    })

    it('should revert if the caller is not the owner', async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      
      const setText = () => contract.write.setText(['Bye World'], {
        account: otherAccount.account.address,
      });

      await expect(setText()).to.be.rejected
    });
  });

  describe('transferOwnership', function () {
    it('should transfer the ownership to the other account', async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);

      await contract.write.transferOwnership([otherAccount.account.address]);
      const result = await contract.read.owner();

      expect(result.toLowerCase()).to.equal(otherAccount.account.address);
    })

    it('should revert if the caller is not the owner', async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      
      const transferOwnership = () => contract.write.transferOwnership([otherAccount.account.address], {
        account: otherAccount.account.address,
      });

      await expect(transferOwnership()).to.be.rejected
    });
  })
});
