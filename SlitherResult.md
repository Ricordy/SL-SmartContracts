(base) rodrigobarrocas@MacBook-Pro MixedContracts % slither . --checklist --markdown-root https://github.com/ORG/REPO/blob/REPO/
'npx hardhat clean' running (wd: /Users/rodrigobarrocas/Desktop/SomethingLegendary/MixedContracts)
'npx hardhat clean --global' running (wd: /Users/rodrigobarrocas/Desktop/SomethingLegendary/MixedContracts)
'npx hardhat compile --force' running
Downloading compiler 0.8.17
Generating typings for: 21 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 58 typings!
Compiled 20 Solidity files successfully


Puzzle.tRandom() (contracts/Puzzle.sol#122-126) uses a weak PRNG: "rnd = (uint256(keccak256(bytes)(abi.encodePacked(block.timestamp,block.difficulty,msg.sender))) % MOTOR) (contracts/Puzzle.sol#123-124)" 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#weak-PRNG

Investment.invest(uint256) (contracts/Investment.sol#83-103) ignores return value by _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#92)
Investment.withdraw() (contracts/Investment.sol#105-116) ignores return value by _token.transfer(msg.sender,finalAmount * 10 ** _token.decimals()) (contracts/Investment.sol#113)
Investment.withdrawSL() (contracts/Investment.sol#118-129) ignores return value by _token.transfer(msg.sender,totalContractBalanceStable(_token)) (contracts/Investment.sol#126)
Investment.refill(uint256,uint256) (contracts/Investment.sol#131-141) ignores return value by _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#135)
Puzzle.mintEntry() (contracts/Puzzle.sol#107-115) ignores return value by _token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals()) (contracts/Puzzle.sol#111)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unchecked-transfer

Puzzle.base_uri_not_revealed (contracts/Puzzle.sol#48) is never initialized. It is used in:
	- Puzzle.tokenURI(uint256) (contracts/Puzzle.sol#175-185)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-state-variables

Puzzle.tokenURI(uint256) (contracts/Puzzle.sol#175-185) uses a Boolean constant improperly:
	-true (contracts/Puzzle.sol#177)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#misuse-of-a-boolean-constant

Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse = (3 * denominator) ^ 2 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#117)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#121)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#122)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#123)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#124)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#125)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#126)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) performs a multiplication on the result of a division:
	- prod0 = prod0 / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#105)
	- result = prod0 * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#132)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#divide-before-multiply

Reentrancy in Puzzle.claim() (contracts/Puzzle.sol#97-105):
	External calls:
	- _mint(msg.sender,ID,1,) (contracts/Puzzle.sol#101)
		- IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
	State variables written after the call(s):
	- tokenID[ID] ++ (contracts/Puzzle.sol#103)
	Puzzle.tokenID (contracts/Puzzle.sol#41) can be used in cross function reentrancies:
	- Puzzle.constructor(address,address) (contracts/Puzzle.sol#84-91)
	- Puzzle.mintTest() (contracts/Puzzle.sol#201-206)
	- userPuzzlePieces[msg.sender] ++ (contracts/Puzzle.sol#102)
	Puzzle.userPuzzlePieces (contracts/Puzzle.sol#43) can be used in cross function reentrancies:
	- Puzzle.verifyClaim(address) (contracts/Puzzle.sol#166-173)
Reentrancy in Investment.invest(uint256) (contracts/Investment.sol#83-103):
	External calls:
	- _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#92)
	State variables written after the call(s):
	- _mint(msg.sender,_amount * 10 ** DECIMALSUSDC) (contracts/Investment.sol#93)
		- _balances[account] += amount (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#267)
	ERC20._balances (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#36) can be used in cross function reentrancies:
	- ERC20._transfer(address,address,uint256) (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#226-248)
	- ERC20.balanceOf(address) (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#101-103)
Reentrancy in Puzzle.mintEntry() (contracts/Puzzle.sol#107-115):
	External calls:
	- _token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals()) (contracts/Puzzle.sol#111)
	State variables written after the call(s):
	- tokenID[LEVEL1] ++ (contracts/Puzzle.sol#112)
	Puzzle.tokenID (contracts/Puzzle.sol#41) can be used in cross function reentrancies:
	- Puzzle.constructor(address,address) (contracts/Puzzle.sol#84-91)
	- Puzzle.mintTest() (contracts/Puzzle.sol#201-206)
Reentrancy in Puzzle.mintEntry() (contracts/Puzzle.sol#107-115):
	External calls:
	- _token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals()) (contracts/Puzzle.sol#111)
	- _mint(msg.sender,LEVEL1,1,) (contracts/Puzzle.sol#113)
		- IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
	State variables written after the call(s):
	- _mint(msg.sender,LEVEL1,1,) (contracts/Puzzle.sol#113)
		- _balances[id][to] += amount (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#280)
	ERC1155._balances (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#24) can be used in cross function reentrancies:
	- ERC1155._mint(address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#266-286)
	- ERC1155._safeBatchTransferFrom(address,address,uint256[],uint256[],bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#199-230)
	- ERC1155._safeTransferFrom(address,address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#160-187)
	- ERC1155.balanceOf(address,uint256) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#70-73)
Reentrancy in Puzzle.mintTest() (contracts/Puzzle.sol#201-206):
	External calls:
	- _mint(msg.sender,i,1,) (contracts/Puzzle.sol#203)
		- IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
	State variables written after the call(s):
	- tokenID[i] ++ (contracts/Puzzle.sol#204)
	Puzzle.tokenID (contracts/Puzzle.sol#41) can be used in cross function reentrancies:
	- Puzzle.constructor(address,address) (contracts/Puzzle.sol#84-91)
	- Puzzle.mintTest() (contracts/Puzzle.sol#201-206)
Reentrancy in Investment.refill(uint256,uint256) (contracts/Investment.sol#131-141):
	External calls:
	- _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#135)
	State variables written after the call(s):
	- changeStatus(Status.Withdraw) (contracts/Investment.sol#138)
		- status = _status (contracts/Investment.sol#198)
	Investment.status (contracts/Investment.sol#31) can be used in cross function reentrancies:
	- Investment.changeStatus(Investment.Status) (contracts/Investment.sol#197-199)
	- Investment.isNotPaused() (contracts/Investment.sol#164-167)
	- Investment.isProcess() (contracts/Investment.sol#174-177)
	- Investment.status (contracts/Investment.sol#31)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-1

ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).reason (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#503) is a local variable never initialized
Puzzle.constructor(address,address).i (contracts/Puzzle.sol#85) is a local variable never initialized
ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).response (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#498) is a local variable never initialized
Puzzle.verifyBurn(address).i_scope_0 (contracts/Puzzle.sol#154) is a local variable never initialized
ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).reason (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#480) is a local variable never initialized
Puzzle.mintTest().i (contracts/Puzzle.sol#202) is a local variable never initialized
Factory.getAddressTotal(address).i (contracts/Factory.sol#35) is a local variable never initialized
ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).response (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476) is a local variable never initialized
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-local-variables

ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#467-486) ignores return value by IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#488-509) ignores return value by IERC1155Receiver(to).onERC1155BatchReceived(operator,from,ids,amounts,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#497-507)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-return

Investment.changeStatus(Investment.Status)._status (contracts/Investment.sol#197) shadows:
	- ReentrancyGuard._status (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#37) (state variable)
Investment._changeStatus(Investment.Status)._status (contracts/Investment.sol#201) shadows:
	- ReentrancyGuard._status (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#37) (state variable)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#local-variable-shadowing

Factory.setEntryAddress(address)._lgentry (contracts/Factory.sol#44) lacks a zero-check on :
		- lgentry = _lgentry (contracts/Factory.sol#45)
Investment.constructor(uint256,address,address)._entryNFTAddress (contracts/Investment.sol#73) lacks a zero-check on :
		- entryNFTAddress = _entryNFTAddress (contracts/Investment.sol#75)
Investment.constructor(uint256,address,address)._paymentTokenAddress (contracts/Investment.sol#73) lacks a zero-check on :
		- paymentTokenAddress = _paymentTokenAddress (contracts/Investment.sol#76)
Puzzle.constructor(address,address)._factoryAddress (contracts/Puzzle.sol#84) lacks a zero-check on :
		- factoryAddress = _factoryAddress (contracts/Puzzle.sol#89)
Puzzle.constructor(address,address)._paymentTokenAddress (contracts/Puzzle.sol#84) lacks a zero-check on :
		- paymentTokenAddress = _paymentTokenAddress (contracts/Puzzle.sol#90)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-zero-address-validation

Factory.getAddressTotal(address) (contracts/Factory.sol#34-38) has external calls inside a loop: userTotal += ERC20(deployedContracts[i]).balanceOf(user) (contracts/Factory.sol#36)
ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#467-486) has external calls inside a loop: IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation/#calls-inside-a-loop

Variable 'ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).response (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476)' in ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#467-486) potentially used before declaration: response != IERC1155Receiver.onERC1155Received.selector (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#477)
Variable 'ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).reason (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#480)' in ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#467-486) potentially used before declaration: revert(string)(reason) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#481)
Variable 'ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).response (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#498)' in ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#488-509) potentially used before declaration: response != IERC1155Receiver.onERC1155BatchReceived.selector (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#500)
Variable 'ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).reason (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#503)' in ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#488-509) potentially used before declaration: revert(string)(reason) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#504)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#pre-declaration-usage-of-local-variables

Reentrancy in Puzzle.burn() (contracts/Puzzle.sol#131-140):
	External calls:
	- _mint(msg.sender,LEVEL2,1,) (contracts/Puzzle.sol#136)
		- IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data) (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#476-484)
	State variables written after the call(s):
	- tokenID[LEVEL2] ++ (contracts/Puzzle.sol#138)
Reentrancy in Factory.deployNew(uint256,address) (contracts/Factory.sol#22-32):
	External calls:
	- inv.transferOwnership(msg.sender) (contracts/Factory.sol#25)
	State variables written after the call(s):
	- deployedContracts.push(inv) (contracts/Factory.sol#27)
Reentrancy in Investment.invest(uint256) (contracts/Investment.sol#83-103):
	External calls:
	- _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#92)
	State variables written after the call(s):
	- _mint(msg.sender,_amount * 10 ** DECIMALSUSDC) (contracts/Investment.sol#93)
		- _totalSupply += amount (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#264)
	- _changeStatus(Status.Process) (contracts/Investment.sol#98)
		- status = _status (contracts/Investment.sol#202)
Reentrancy in Investment.refill(uint256,uint256) (contracts/Investment.sol#131-141):
	External calls:
	- _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#135)
	State variables written after the call(s):
	- returnProfit = _profitRate (contracts/Investment.sol#136)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-2

Reentrancy in Factory.deployNew(uint256,address) (contracts/Factory.sol#22-32):
	External calls:
	- inv.transferOwnership(msg.sender) (contracts/Factory.sol#25)
	Event emitted after the call(s):
	- ContractCreated(counter,address(inv)) (contracts/Factory.sol#30)
Reentrancy in Investment.refill(uint256,uint256) (contracts/Investment.sol#131-141):
	External calls:
	- _token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals()) (contracts/Investment.sol#135)
	Event emitted after the call(s):
	- ContractRefilled(_amount,_profitRate,block.timestamp) (contracts/Investment.sol#140)
Reentrancy in Investment.withdrawSL() (contracts/Investment.sol#118-129):
	External calls:
	- _token.transfer(msg.sender,totalContractBalanceStable(_token)) (contracts/Investment.sol#126)
	Event emitted after the call(s):
	- SLWithdraw(totalBalance,block.timestamp) (contracts/Investment.sol#128)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-3

Puzzle.claim() (contracts/Puzzle.sol#97-105) uses timestamp for comparisons
	Dangerous comparisons:
	- require(bool,string)(tokenID[ID] <= MAX_PER_COLLECTION,Collection limit reached) (contracts/Puzzle.sol#100)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#block-timestamp

Address._revert(bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#231-243) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Address.sol#236-239)
Strings.toString(uint256) (node_modules/@openzeppelin/contracts/utils/Strings.sol#18-38) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#24-26)
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#30-32)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#55-135) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#66-70)
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#86-93)
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#100-109)
console._sendLogPayload(bytes) (node_modules/hardhat/console.sol#7-14) uses assembly
	- INLINE ASM (node_modules/hardhat/console.sol#10-13)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#assembly-usage

Different versions of Solidity are used:
	- Version used: ['>=0.4.22<0.9.0', '^0.8.0', '^0.8.1', '^0.8.4', '^0.8.9']
	- >=0.4.22<0.9.0 (node_modules/hardhat/console.sol#2)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/access/Ownable.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/utils/Context.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/utils/Strings.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#4)
	- ^0.8.0 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#4)
	- ^0.8.0 (contracts/CoinTest.sol#2)
	- ^0.8.1 (node_modules/@openzeppelin/contracts/utils/Address.sol#4)
	- ^0.8.4 (contracts/Puzzle.sol#2)
	- ^0.8.9 (contracts/Factory.sol#2)
	- ^0.8.9 (contracts/Investment.sol#2)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#different-pragma-directives-are-used

Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/access/Ownable.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4) allows old versions
Pragma version^0.8.1 (node_modules/@openzeppelin/contracts/utils/Address.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/Context.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/Strings.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#4) allows old versions
Pragma version^0.8.0 (contracts/CoinTest.sol#2) allows old versions
Pragma version^0.8.9 (contracts/Factory.sol#2) allows old versions
Pragma version^0.8.9 (contracts/Investment.sol#2) allows old versions
Pragma version^0.8.4 (contracts/Puzzle.sol#2) allows old versions
Pragma version>=0.4.22<0.9.0 (node_modules/hardhat/console.sol#2) is too complex
solc-0.8.17 is not recommended for deployment
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity

Low level call in Address.sendValue(address,uint256) (node_modules/@openzeppelin/contracts/utils/Address.sol#60-65):
	- (success) = recipient.call{value: amount}() (node_modules/@openzeppelin/contracts/utils/Address.sol#63)
Low level call in Address.functionCallWithValue(address,bytes,uint256,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#128-137):
	- (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
Low level call in Address.functionStaticCall(address,bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#155-162):
	- (success,returndata) = target.staticcall(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#160)
Low level call in Address.functionDelegateCall(address,bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#180-187):
	- (success,returndata) = target.delegatecall(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#185)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#low-level-calls

Factory (contracts/Factory.sol#9-56) should inherit from IFactory (contracts/Puzzle.sol#11-13)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-inheritance

Parameter Factory.deployNew(uint256,address)._totalInvestment (contracts/Factory.sol#22) is not in mixedCase
Parameter Factory.deployNew(uint256,address)._paymentTokenAddress (contracts/Factory.sol#22) is not in mixedCase
Parameter Factory.setEntryAddress(address)._lgentry (contracts/Factory.sol#44) is not in mixedCase
Parameter Investment.invest(uint256)._amount (contracts/Investment.sol#83) is not in mixedCase
Parameter Investment.refill(uint256,uint256)._amount (contracts/Investment.sol#131) is not in mixedCase
Parameter Investment.refill(uint256,uint256)._profitRate (contracts/Investment.sol#131) is not in mixedCase
Parameter Investment.totalContractBalanceStable(ERC20)._token (contracts/Investment.sol#146) is not in mixedCase
Parameter Investment.calculateFinalAmount(uint256)._amount (contracts/Investment.sol#157) is not in mixedCase
Parameter Investment.changeStatus(Investment.Status)._status (contracts/Investment.sol#197) is not in mixedCase
Variable Puzzle.COLLECTION_IDS (contracts/Puzzle.sol#34) is not in mixedCase
Variable Puzzle.MAX_LOT (contracts/Puzzle.sol#36) is not in mixedCase
Variable Puzzle.base_uri_not_revealed (contracts/Puzzle.sol#48) is not in mixedCase
Variable Puzzle.base_uri (contracts/Puzzle.sol#49) is not in mixedCase
Contract console (node_modules/hardhat/console.sol#4-1532) is not in CapWords
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformance-to-solidity-naming-conventions

Puzzle.isReaveled (contracts/Puzzle.sol#50) is never used in Puzzle (contracts/Puzzle.sol#16-217)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-state-variable

Puzzle.base_uri (contracts/Puzzle.sol#49) should be constant 
Puzzle.base_uri_not_revealed (contracts/Puzzle.sol#48) should be constant 
Puzzle.isReaveled (contracts/Puzzle.sol#50) should be constant 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-constant

Investment.entryNFTAddress (contracts/Investment.sol#35) should be immutable 
Investment.paymentTokenAddress (contracts/Investment.sol#34) should be immutable 
Puzzle.factoryAddress (contracts/Puzzle.sol#52) should be immutable 
Puzzle.paymentTokenAddress (contracts/Puzzle.sol#53) should be immutable 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-immutable
Summary
 - [weak-prng](#weak-prng) (1 results) (High)
 - [unchecked-transfer](#unchecked-transfer) (5 results) (High)
 - [uninitialized-state](#uninitialized-state) (1 results) (High)
 - [boolean-cst](#boolean-cst) (1 results) (Medium)
 - [divide-before-multiply](#divide-before-multiply) (8 results) (Medium)
 - [reentrancy-no-eth](#reentrancy-no-eth) (6 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (8 results) (Medium)
 - [unused-return](#unused-return) (2 results) (Medium)
 - [shadowing-local](#shadowing-local) (2 results) (Low)
 - [missing-zero-check](#missing-zero-check) (5 results) (Low)
 - [calls-loop](#calls-loop) (2 results) (Low)
 - [variable-scope](#variable-scope) (4 results) (Low)
 - [reentrancy-benign](#reentrancy-benign) (4 results) (Low)
 - [reentrancy-events](#reentrancy-events) (3 results) (Low)
 - [timestamp](#timestamp) (1 results) (Low)
 - [assembly](#assembly) (4 results) (Informational)
 - [pragma](#pragma) (1 results) (Informational)
 - [solc-version](#solc-version) (21 results) (Informational)
 - [low-level-calls](#low-level-calls) (4 results) (Informational)
 - [missing-inheritance](#missing-inheritance) (1 results) (Informational)
 - [naming-convention](#naming-convention) (14 results) (Informational)
 - [unused-state](#unused-state) (1 results) (Informational)
 - [constable-states](#constable-states) (3 results) (Optimization)
 - [immutable-states](#immutable-states) (4 results) (Optimization)
## weak-prng
Impact: High
Confidence: Medium
 - [ ] ID-0
[Puzzle.tRandom()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L122-L126) uses a weak PRNG: "[rnd = (uint256(keccak256(bytes)(abi.encodePacked(block.timestamp,block.difficulty,msg.sender))) % MOTOR)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L123-L124)" 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L122-L126


## unchecked-transfer
Impact: High
Confidence: Medium
 - [ ] ID-1
[Investment.withdraw()](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L105-L116) ignores return value by [_token.transfer(msg.sender,finalAmount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L113)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L105-L116


 - [ ] ID-2
[Investment.withdrawSL()](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L118-L129) ignores return value by [_token.transfer(msg.sender,totalContractBalanceStable(_token))](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L126)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L118-L129


 - [ ] ID-3
[Investment.refill(uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141) ignores return value by [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L135)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141


 - [ ] ID-4
[Puzzle.mintEntry()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115) ignores return value by [_token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L111)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115


 - [ ] ID-5
[Investment.invest(uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103) ignores return value by [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L92)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103


## uninitialized-state
Impact: High
Confidence: High
 - [ ] ID-6
[Puzzle.base_uri_not_revealed](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48) is never initialized. It is used in:
	- [Puzzle.tokenURI(uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L175-L185)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48


## boolean-cst
Impact: Medium
Confidence: Medium
 - [ ] ID-7
[Puzzle.tokenURI(uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L175-L185) uses a Boolean constant improperly:
	-[true](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L177)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L175-L185


## divide-before-multiply
Impact: Medium
Confidence: Medium
 - [ ] ID-8
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L126)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-9
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L124)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-10
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L123)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-11
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L121)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-12
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse = (3 * denominator) ^ 2](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L117)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-13
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L122)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-14
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [prod0 = prod0 / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L105)
	- [result = prod0 * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L132)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-15
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) performs a multiplication on the result of a division:
	- [denominator = denominator / twos](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L102)
	- [inverse *= 2 - denominator * inverse](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L125)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


## reentrancy-no-eth
Impact: Medium
Confidence: Medium
 - [ ] ID-16
Reentrancy in [Puzzle.mintEntry()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L111)
	- [_mint(msg.sender,LEVEL1,1,)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L113)
		- [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)
	State variables written after the call(s):
	- [_mint(msg.sender,LEVEL1,1,)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L113)
		- [_balances[id][to] += amount](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L280)
	[ERC1155._balances](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L24) can be used in cross function reentrancies:
	- [ERC1155._mint(address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L266-L286)
	- [ERC1155._safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L199-L230)
	- [ERC1155._safeTransferFrom(address,address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L160-L187)
	- [ERC1155.balanceOf(address,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L70-L73)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115


 - [ ] ID-17
Reentrancy in [Puzzle.mintEntry()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),ENTRY_NFT_PRICE * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L111)
	State variables written after the call(s):
	- [tokenID[LEVEL1] ++](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L112)
	[Puzzle.tokenID](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L41) can be used in cross function reentrancies:
	- [Puzzle.constructor(address,address)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84-L91)
	- [Puzzle.mintTest()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L201-L206)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L107-L115


 - [ ] ID-18
Reentrancy in [Investment.refill(uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L135)
	State variables written after the call(s):
	- [changeStatus(Status.Withdraw)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L138)
		- [status = _status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L198)
	[Investment.status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L31) can be used in cross function reentrancies:
	- [Investment.changeStatus(Investment.Status)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L197-L199)
	- [Investment.isNotPaused()](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L164-L167)
	- [Investment.isProcess()](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L174-L177)
	- [Investment.status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L31)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141


 - [ ] ID-19
Reentrancy in [Investment.invest(uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L92)
	State variables written after the call(s):
	- [_mint(msg.sender,_amount * 10 ** DECIMALSUSDC)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L93)
		- [_balances[account] += amount](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L267)
	[ERC20._balances](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L36) can be used in cross function reentrancies:
	- [ERC20._transfer(address,address,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L226-L248)
	- [ERC20.balanceOf(address)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L101-L103)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103


 - [ ] ID-20
Reentrancy in [Puzzle.mintTest()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L201-L206):
	External calls:
	- [_mint(msg.sender,i,1,)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L203)
		- [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)
	State variables written after the call(s):
	- [tokenID[i] ++](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L204)
	[Puzzle.tokenID](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L41) can be used in cross function reentrancies:
	- [Puzzle.constructor(address,address)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84-L91)
	- [Puzzle.mintTest()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L201-L206)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L201-L206


 - [ ] ID-21
Reentrancy in [Puzzle.claim()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L97-L105):
	External calls:
	- [_mint(msg.sender,ID,1,)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L101)
		- [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)
	State variables written after the call(s):
	- [tokenID[ID] ++](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L103)
	[Puzzle.tokenID](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L41) can be used in cross function reentrancies:
	- [Puzzle.constructor(address,address)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84-L91)
	- [Puzzle.mintTest()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L201-L206)
	- [userPuzzlePieces[msg.sender] ++](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L102)
	[Puzzle.userPuzzlePieces](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L43) can be used in cross function reentrancies:
	- [Puzzle.verifyClaim(address)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L166-L173)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L97-L105


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-22
[Puzzle.constructor(address,address).i](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L85) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L85


 - [ ] ID-23
[Puzzle.verifyBurn(address).i_scope_0](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L154) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L154


 - [ ] ID-24
[Puzzle.mintTest().i](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L202) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L202


 - [ ] ID-25
[ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).response](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L498) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L498


 - [ ] ID-26
[Factory.getAddressTotal(address).i](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L35) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L35


 - [ ] ID-27
[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).reason](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L480) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L480


 - [ ] ID-28
[ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).reason](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L503) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L503


 - [ ] ID-29
[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).response](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476) is a local variable never initialized

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-30
[ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L488-L509) ignores return value by [IERC1155Receiver(to).onERC1155BatchReceived(operator,from,ids,amounts,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L497-L507)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L488-L509


 - [ ] ID-31
[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486) ignores return value by [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486


## shadowing-local
Impact: Low
Confidence: High
 - [ ] ID-32
[Investment._changeStatus(Investment.Status)._status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L201) shadows:
	- [ReentrancyGuard._status](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L37) (state variable)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L201


 - [ ] ID-33
[Investment.changeStatus(Investment.Status)._status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L197) shadows:
	- [ReentrancyGuard._status](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L37) (state variable)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L197


## missing-zero-check
Impact: Low
Confidence: Medium
 - [ ] ID-34
[Puzzle.constructor(address,address)._factoryAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84) lacks a zero-check on :
		- [factoryAddress = _factoryAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L89)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84


 - [ ] ID-35
[Investment.constructor(uint256,address,address)._entryNFTAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L73) lacks a zero-check on :
		- [entryNFTAddress = _entryNFTAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L75)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L73


 - [ ] ID-36
[Puzzle.constructor(address,address)._paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84) lacks a zero-check on :
		- [paymentTokenAddress = _paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L90)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L84


 - [ ] ID-37
[Factory.setEntryAddress(address)._lgentry](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L44) lacks a zero-check on :
		- [lgentry = _lgentry](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L45)

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L44


 - [ ] ID-38
[Investment.constructor(uint256,address,address)._paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L73) lacks a zero-check on :
		- [paymentTokenAddress = _paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L76)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L73


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-39
[Factory.getAddressTotal(address)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L34-L38) has external calls inside a loop: [userTotal += ERC20(deployedContracts[i]).balanceOf(user)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L36)

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L34-L38


 - [ ] ID-40
[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486) has external calls inside a loop: [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486


## variable-scope
Impact: Low
Confidence: High
 - [ ] ID-41
Variable '[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).reason](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L480)' in [ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486) potentially used before declaration: [revert(string)(reason)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L481)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L480


 - [ ] ID-42
Variable '[ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).response](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L498)' in [ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L488-L509) potentially used before declaration: [response != IERC1155Receiver.onERC1155BatchReceived.selector](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L500)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L498


 - [ ] ID-43
Variable '[ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes).reason](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L503)' in [ERC1155._doSafeBatchTransferAcceptanceCheck(address,address,address,uint256[],uint256[],bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L488-L509) potentially used before declaration: [revert(string)(reason)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L504)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L503


 - [ ] ID-44
Variable '[ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes).response](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476)' in [ERC1155._doSafeTransferAcceptanceCheck(address,address,address,uint256,uint256,bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L467-L486) potentially used before declaration: [response != IERC1155Receiver.onERC1155Received.selector](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L477)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476


## reentrancy-benign
Impact: Low
Confidence: Medium
 - [ ] ID-45
Reentrancy in [Puzzle.burn()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L131-L140):
	External calls:
	- [_mint(msg.sender,LEVEL2,1,)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L136)
		- [IERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L476-L484)
	State variables written after the call(s):
	- [tokenID[LEVEL2] ++](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L138)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L131-L140


 - [ ] ID-46
Reentrancy in [Investment.invest(uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L92)
	State variables written after the call(s):
	- [_mint(msg.sender,_amount * 10 ** DECIMALSUSDC)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L93)
		- [_totalSupply += amount](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L264)
	- [_changeStatus(Status.Process)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L98)
		- [status = _status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L202)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83-L103


 - [ ] ID-47
Reentrancy in [Investment.refill(uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L135)
	State variables written after the call(s):
	- [returnProfit = _profitRate](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L136)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141


 - [ ] ID-48
Reentrancy in [Factory.deployNew(uint256,address)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22-L32):
	External calls:
	- [inv.transferOwnership(msg.sender)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L25)
	State variables written after the call(s):
	- [deployedContracts.push(inv)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L27)

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22-L32


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-49
Reentrancy in [Factory.deployNew(uint256,address)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22-L32):
	External calls:
	- [inv.transferOwnership(msg.sender)](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L25)
	Event emitted after the call(s):
	- [ContractCreated(counter,address(inv))](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L30)

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22-L32


 - [ ] ID-50
Reentrancy in [Investment.refill(uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141):
	External calls:
	- [_token.transferFrom(msg.sender,address(this),_amount * 10 ** _token.decimals())](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L135)
	Event emitted after the call(s):
	- [ContractRefilled(_amount,_profitRate,block.timestamp)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L140)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131-L141


 - [ ] ID-51
Reentrancy in [Investment.withdrawSL()](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L118-L129):
	External calls:
	- [_token.transfer(msg.sender,totalContractBalanceStable(_token))](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L126)
	Event emitted after the call(s):
	- [SLWithdraw(totalBalance,block.timestamp)](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L128)

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L118-L129


## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-52
[Puzzle.claim()](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L97-L105) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(tokenID[ID] <= MAX_PER_COLLECTION,Collection limit reached)](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L100)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L97-L105


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-53
[console._sendLogPayload(bytes)](https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L7-L14) uses assembly
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L10-L13)

https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L7-L14


 - [ ] ID-54
[Math.mulDiv(uint256,uint256,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135) uses assembly
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L66-L70)
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L86-L93)
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L100-L109)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L55-L135


 - [ ] ID-55
[Strings.toString(uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L18-L38) uses assembly
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L24-L26)
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L30-L32)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L18-L38


 - [ ] ID-56
[Address._revert(bytes,string)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L231-L243) uses assembly
	- [INLINE ASM](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L236-L239)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L231-L243


## pragma
Impact: Informational
Confidence: High
 - [ ] ID-57
Different versions of Solidity are used:
	- Version used: ['>=0.4.22<0.9.0', '^0.8.0', '^0.8.1', '^0.8.4', '^0.8.9']
	- [>=0.4.22<0.9.0](https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L2)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/access/Ownable.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Context.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L4)
	- [^0.8.0](https://github.com/ORG/REPO/blob/REPO/contracts/CoinTest.sol#L2)
	- [^0.8.1](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L4)
	- [^0.8.4](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L2)
	- [^0.8.9](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L2)
	- [^0.8.9](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L2)

https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L2


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-58
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#L4


 - [ ] ID-59
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/math/Math.sol#L4


 - [ ] ID-60
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Context.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Context.sol#L4


 - [ ] ID-61
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#L4


 - [ ] ID-62
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Strings.sol#L4


 - [ ] ID-63
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol#L4


 - [ ] ID-64
Pragma version[^0.8.9](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L2) allows old versions

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L2


 - [ ] ID-65
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol#L4


 - [ ] ID-66
Pragma version[^0.8.1](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L4


 - [ ] ID-67
Pragma version[^0.8.9](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L2) allows old versions

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L2


 - [ ] ID-68
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol#L4


 - [ ] ID-69
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/contracts/CoinTest.sol#L2) allows old versions

https://github.com/ORG/REPO/blob/REPO/contracts/CoinTest.sol#L2


 - [ ] ID-70
solc-0.8.17 is not recommended for deployment

 - [ ] ID-71
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#L4


 - [ ] ID-72
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#L4


 - [ ] ID-73
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#L4


 - [ ] ID-74
Pragma version[^0.8.4](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L2) allows old versions

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L2


 - [ ] ID-75
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/access/Ownable.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/access/Ownable.sol#L4


 - [ ] ID-76
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#L4


 - [ ] ID-77
Pragma version[>=0.4.22<0.9.0](https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L2) is too complex

https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L2


 - [ ] ID-78
Pragma version[^0.8.0](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol#L4) allows old versions

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol#L4


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-79
Low level call in [Address.functionCallWithValue(address,bytes,uint256,string)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L128-L137):
	- [(success,returndata) = target.call{value: value}(data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L135)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L128-L137


 - [ ] ID-80
Low level call in [Address.sendValue(address,uint256)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L60-L65):
	- [(success) = recipient.call{value: amount}()](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L63)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L60-L65


 - [ ] ID-81
Low level call in [Address.functionStaticCall(address,bytes,string)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L155-L162):
	- [(success,returndata) = target.staticcall(data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L160)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L155-L162


 - [ ] ID-82
Low level call in [Address.functionDelegateCall(address,bytes,string)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L180-L187):
	- [(success,returndata) = target.delegatecall(data)](https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L185)

https://github.com/ORG/REPO/blob/REPO/node_modules/@openzeppelin/contracts/utils/Address.sol#L180-L187


## missing-inheritance
Impact: Informational
Confidence: High
 - [ ] ID-83
[Factory](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L9-L56) should inherit from [IFactory](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L11-L13)

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L9-L56


## naming-convention
Impact: Informational
Confidence: High
 - [ ] ID-84
Parameter [Investment.totalContractBalanceStable(ERC20)._token](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L146) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L146


 - [ ] ID-85
Parameter [Investment.refill(uint256,uint256)._amount](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131


 - [ ] ID-86
Variable [Puzzle.base_uri_not_revealed](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48


 - [ ] ID-87
Contract [console](https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L4-L1532) is not in CapWords

https://github.com/ORG/REPO/blob/REPO/node_modules/hardhat/console.sol#L4-L1532


 - [ ] ID-88
Variable [Puzzle.COLLECTION_IDS](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L34) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L34


 - [ ] ID-89
Parameter [Investment.refill(uint256,uint256)._profitRate](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L131


 - [ ] ID-90
Parameter [Investment.invest(uint256)._amount](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L83


 - [ ] ID-91
Variable [Puzzle.MAX_LOT](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L36) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L36


 - [ ] ID-92
Parameter [Investment.calculateFinalAmount(uint256)._amount](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L157) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L157


 - [ ] ID-93
Parameter [Factory.deployNew(uint256,address)._totalInvestment](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22


 - [ ] ID-94
Parameter [Factory.deployNew(uint256,address)._paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L22


 - [ ] ID-95
Parameter [Investment.changeStatus(Investment.Status)._status](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L197) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L197


 - [ ] ID-96
Parameter [Factory.setEntryAddress(address)._lgentry](https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L44) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Factory.sol#L44


 - [ ] ID-97
Variable [Puzzle.base_uri](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L49) is not in mixedCase

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L49


## unused-state
Impact: Informational
Confidence: High
 - [ ] ID-98
[Puzzle.isReaveled](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L50) is never used in [Puzzle](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L16-L217)

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L50


## constable-states
Impact: Optimization
Confidence: High
 - [ ] ID-99
[Puzzle.base_uri_not_revealed](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48) should be constant 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L48


 - [ ] ID-100
[Puzzle.isReaveled](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L50) should be constant 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L50


 - [ ] ID-101
[Puzzle.base_uri](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L49) should be constant 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L49


## immutable-states
Impact: Optimization
Confidence: High
 - [ ] ID-102
[Investment.entryNFTAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L35) should be immutable 

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L35


 - [ ] ID-103
[Puzzle.factoryAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L52) should be immutable 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L52


 - [ ] ID-104
[Puzzle.paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L53) should be immutable 

https://github.com/ORG/REPO/blob/REPO/contracts/Puzzle.sol#L53


 - [ ] ID-105
[Investment.paymentTokenAddress](https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L34) should be immutable 

https://github.com/ORG/REPO/blob/REPO/contracts/Investment.sol#L34


. analyzed (21 contracts with 84 detectors), 106 result(s) found
(base) rodrigobarrocas@MacBook-Pro MixedContracts % 
