import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Proposal test Test", function () {

    const proposal1 = {
        name: "let us vote",
        desc: "Participate in the coming Election",
        votes: 0,
        voters: [],
        quorum: 3,
        status: 1,
    }
    const proposal2 = {
        name: "let us run",
        desc: "Participate in the coming Marathon",
        votes: 0,
        voters: [],
        quorum: 3,
        status: 1,
    }

    

    async function deployProposalFixture(){

      
        const signers = await hre.ethers.getSigners();

        const Proposal = await hre.ethers.getContractFactory("ProposalVote");
        const proposal = await Proposal.deploy();

        const owner = signers[0]
        const otherAccount = signers[1]
        const otherAccount1 = signers[2]
        const otherAccount2 = signers[3]
        const otherAccount3 = signers[4]

        return {proposal, owner, otherAccount, otherAccount1, otherAccount2, otherAccount3}
    }

  

    

    describe("deployment", () => {
        it("should check if it deployed", async function () {
            const {proposal} = await loadFixture(deployProposalFixture);

            expect(await proposal).to.not.be.undefined;
        });
    })

    // describe("deployment", () => {

    // })

    it("Should be able to create proposal", async function () {
        const {proposal, owner} = await loadFixture(deployProposalFixture);

        await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)

        expect(await proposal.getProposal(0)).to.deep.equal([proposal1.name,proposal1.desc, proposal1.votes.toString(),proposal1.voters,proposal1.quorum.toString(),proposal1.status.toString()]);
    });

    it("Should be able to vote on proposal", async function () {
        const {proposal, owner, otherAccount} = await loadFixture(deployProposalFixture);

        const newVotes = 1
        const newVotesStatus = 2

        await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)

        await proposal.connect(otherAccount).voteOnProposal(0)

        expect(await proposal.getProposal(0)).to.deep.equal([proposal1.name,proposal1.desc, newVotes.toString(),[otherAccount.address],proposal1.quorum.toString(),newVotesStatus.toString()]);
    });

    it("Should be able to get all the proposal", async function () {
        const {proposal, owner, otherAccount} = await loadFixture(deployProposalFixture);

        const proposal1Arr = Object.values(proposal1)
        const proposal2Arr = Object.values(proposal2)

        await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)
        await proposal.connect(otherAccount).createProposal(proposal2.name, proposal2.desc, proposal2.quorum)

        const allProposals = await proposal.connect(otherAccount).getAllProposals()

       

        expect(allProposals).to.deep.equal([proposal1Arr, proposal2Arr]);
    });


    it("Should be able to get a proposal", async function () {
        const {proposal, owner, otherAccount} = await loadFixture(deployProposalFixture);

        const proposal1Arr = Object.values(proposal1)
        const proposal2Arr = Object.values(proposal2)

        await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)
        await proposal.connect(otherAccount).createProposal(proposal2.name, proposal2.desc, proposal2.quorum)

        const aProposal = await proposal.connect(otherAccount).getProposal(0)

       

        expect(aProposal).to.deep.equal(proposal1Arr);
    });

    describe("checking logs", () => {

        it("Should be able log created proposal", async function () {
            const {proposal, owner} = await loadFixture(deployProposalFixture);
    
         
            const createdProposal =await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)
    
            expect(createdProposal).to.emit(proposal, "ProposalCreated").withArgs(proposal1.name, proposal1.quorum)
        });

        it("Should be able log a vote on a proposal", async function () {
            const {proposal, owner, otherAccount} = await loadFixture(deployProposalFixture);
    
            
            await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)

            await proposal.connect(otherAccount).voteOnProposal(0)

            const aProposal = await proposal.connect(otherAccount).getProposal(0)
    
            expect(await  proposal.connect(owner).voteOnProposal(0)).to.emit(proposal, "ProposalActive").withArgs(proposal1.name,aProposal[2])
        });

        it("Should be able log an approved proposal", async function () {
            const {proposal, owner, otherAccount, otherAccount1, otherAccount2, otherAccount3} = await loadFixture(deployProposalFixture);
    
            await proposal.connect(owner).createProposal(proposal1.name, proposal1.desc, proposal1.quorum)

            await proposal.connect(otherAccount).voteOnProposal(0)
            await proposal.connect(otherAccount1).voteOnProposal(0)

            const aProposal = await proposal.connect(otherAccount).getProposal(0)
    
            expect(await  proposal.connect(owner).voteOnProposal(0)).to.emit(proposal, "ProposalApproved").withArgs(proposal1.name,aProposal[2])
        });

    })

})